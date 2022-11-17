# Making Ray work with Firewalled servers

**Assumptions**:
1. Head node is firewalled but worker nodes are not.
2. Nodes _can_ ssh into each other.

## Steps:

On the head node, run the following commands:
1. `ray stop`
2. `ray start --head --port=6379 --redis-shard-ports=6380 --object-manager-port=6381 --node-manager-port=6382`
3. `ray status` should show the head node as running.

On the worker nodes, run the following commands:
1. create an entry in `~/.ssh/config` that looks like this:
```
Host head-node
    HostName <head-node-ip>
    User <head-node-user>
    LocalForward 6379 localhost:6379 # redis/gcs
    LocalForward 6380 localhost:6380 # redis-shard-ports
    LocalForward 6381 localhost:6381 # object-manager ports
    LocalForward 6382 localhost:6382 # node-manager ports
    LocalForward 8265 localhost:8265 # dashboard
```

2. ssh into the head node: `ssh head-node` in a separate terminal. (or you could just run `ssh head-node -N` in the background)
3. create a dummy entry in `/etc/hosts`, e.g., `127.0.0.1 fake-head-node`. (yes. trust me.)
4. `ray start --address='fake-head-node:6379' --resources='{"noobness": 4}' --node-ip-address=<worker-node-public-ip/domain>`
5. `ray status` should show the head node and the worker node as running.

The reason to create a dummy entry in `/etc/hosts` is because the `--address` flag in `ray start` doesn't like "localhost/127.0.0.1". If it sees that, it automatically tries to get another IP (e.g., the node's IP on some other interface). We want to force it to use localhost:6379 because we're tunneling the ports to the head node.

## Caveats:

In step 4, if you don't put the *public ip* of the worker node, then ray fails silently and gives mixed signals. `ray status` will show 2 nodes as connected, but the resources will only be that of the head node.

Another thing to be careful about is, if your worker node is on Azure (or other cloud providers), you would need to add an entry in Azure's firewall to allow all traffic from that public ip. That's because on the worker node, when you run `ray start`, the dashboard agent tries to connect to itself (idk why, it should connect to the head node, right? right?), and that connection is blocked by the firewall. So you need to allow all traffic from the worker node's public ip. (i.e., add an entry like this: `Allow inbound traffic from <worker-node-public-ip> to any port`). This is not needed if the worker node is on-prem.

## Notes:

I think we should be able to possibly make it work when all nodes are behind firewall too, although I've not thought about it yet. The problem is, Ray wants bidirectional communication between nodes, and firewalls cripple that. So we want to get around it using ssh-tunneling, but so far I've only been able to figure out one-way tunneling.