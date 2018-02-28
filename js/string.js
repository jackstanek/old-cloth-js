const STRING_NODE_MATERIAL = new THREE.MeshLambertMaterial( { color: 0xffffff });

function string_neighbors(cloth, node) {
    // Spring restorative forces
    // This first force we know will always exist. (the spring force from above)
    var total_forces = new THREE.Vector3();
    var neighbors = [{x: node.index.x - 1, y: node.index.y},
                     {x: node.index.x + 1, y: node.index.y}];
    for (n in neighbors) {
        let neighbor_index = neighbors[n];
        if (cloth.isValid(neighbor_index)) {
            total_forces.add(node.forceFrom(cloth, neighbor_index));
        }
    }

    return total_forces;
}

function MusicalString(mass, k, damping, node_ct, length, tension) {
    this.mass       = mass;
    this.k          = k;
    this.damping    = damping;
    this.length     = length;
    this.spring_len = tension * length / (node_ct - 1);
    this.nodes      = new Array();
    this.meshes     = new Array();

    for (let i = 0; i < node_ct; i++) {
        this.nodes[i]  = new ClothNode(mass, i, 0,
                                       new THREE.Vector3(i - this.length / 2, 0, 0),
                                       this.k, this.damping);
        this.meshes[i] = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2),
                                        STRING_NODE_MATERIAL);
        this.meshes[i].position.copy(this.nodes[i].pos.ol);
    }
}

MusicalString.prototype.initScene = function(scene) {
    for (i in this.nodes) {
        scene.add(this.meshes[i]);
    }
}

MusicalString.prototype.updatePhysics = function(dt) {
    for (node in this.nodes) {
        this.nodes[node].calculateForces(this, string_neighbors, false, "string");
        this.nodes[node].acc.swap();
        this.nodes[node].updateVelocity(dt);
        this.nodes[node].vel.swap();
    }

    for (node in this.nodes) {
        this.nodes[node].updatePosition(dt);
        this.nodes[node].pos.swap();
        this.meshes[node].position.copy(this.nodes[node].pos.ol);
    }
}

MusicalString.prototype.isValid = function(index) {
    return index.x >= 0 && index.x < this.nodes.length;
}

MusicalString.prototype.nodeAtIndex = function(index) {
    return this.nodes[index.x];
}

MusicalString.prototype.pluck = function() {
    var mid = Math.floor(this.nodes.length / 2);
    this.nodes[mid].pos.ol.setY(1);
}
