/* Some constants. GRAV_ACC is not really a force since it is
 * constant for every object. */
const GRAV_ACC         = new THREE.Vector3(0, -10, 0);

const DEFAULT_MATERIAL = new THREE.MeshPhongMaterial({color: 0xffffff});

function randomVector3() {
    return new THREE.Vector3(Math.random() * 2 - 1,
                             Math.random() * 2 - 1,
                             Math.random() * 2 - 1).normalize();
}

function integrate(y, y_prime, dt) {
    var dy = new THREE.Vector3();
    dy.copy(y_prime.ne);
    dy.multiplyScalar(dt);
    y.ne.add(dy);
}

function ClothNode(mass, x, y, pos, tension, damping) {
    this.mass     = mass;
    this.index    = { x: x, y: y };
    this.pos      = new UpdatableVec3(pos);
    this.dp       = new THREE.Vector3();
    this.vel      = new UpdatableVec3(randomVector3());
    this.dv       = new THREE.Vector3();
    this.acc      = new UpdatableVec3();
}

ClothNode.prototype.updatePhysics = function(cloth, dt) {
    /* The top of the thread is pinned in place. */
    if (this.index.y === 0) {
        return;
    }

    var total_forces = new THREE.Vector3();

    // Spring restorative forces
    // This first force we know will always exist. (the spring force from above)
    var neighbors = [{x: this.index.x, y: this.index.y - 1},
                     {x: this.index.x, y: this.index.y + 1},
                     {x: this.index.x - 1, y: this.index.y},
                     {x: this.index.x + 1, y: this.index.y}];
    for (n in neighbors) {
        let neighbor_index = neighbors[n];
        if (cloth.isValid(neighbor_index)) {
            total_forces.add(this.forceFrom(cloth, neighbor_index));
        }
    }

    // Damping force
    var tmp_vel = new THREE.Vector3();
    tmp_vel.copy(this.vel.ol);
    tmp_vel.negate();
    total_forces.add(tmp_vel.multiplyScalar(cloth.damping));

    // Gravitational force
    total_forces.add(new THREE.Vector3(0, -9.8 * this.mass, 0));

    this.acc.ne.copy(total_forces.divideScalar(this.mass));

    /* Do Eulerian integration for velocity */
    integrate(this.vel, this.acc, dt);

    /* Do Eulerian integration for position */
    integrate(this.pos, this.vel, dt);
}

ClothNode.prototype.commitUpdate = function() {
    this.acc.swap();
    this.vel.swap();
    this.pos.swap();
}

ClothNode.prototype.forceFrom = function(cloth, neighbor_index) {
    var neighbor_spring = new THREE.Vector3();
    neighbor_spring.copy(this.pos.ol);
    neighbor_spring.sub(cloth.nodeAtIndex(neighbor_index).pos.ol);
    neighbor_spring.negate();
    var neighbor_spring_len = neighbor_spring.length();
    /* Add in the spring force (Hooke's Law) */
    return neighbor_spring
        .normalize()
        .multiplyScalar(cloth.tension *
                        (neighbor_spring_len - cloth.spring_len));
}

/* For now, a Cloth object simply represents a thread, string, or
 * rope-like object. */
function Cloth(node_mass, tension, damping, size, density) {
    this.nodes      = new Array();
    this.tension    = tension;
    this.damping    = damping;
    this.size       = size;
    this.density    = Math.floor(density);
    this.spring_len = size / density;

    for (let i = 0; i < density * density; i++) {
        let x = i % this.density, y = Math.floor(i / this.density);
        this.nodes[i] = new ClothNode(node_mass, x, y,
                                      new THREE.Vector3(this.spring_len * x - this.size / 2,
                                                        this.size / 2 - this.spring_len * y, 0));
    }

    this.geometry = new THREE.PlaneGeometry(size, size, density - 1, density - 1);
    this.mesh     = new THREE.Mesh(this.geometry, DEFAULT_MATERIAL);
}

Cloth.prototype.updatePhysics = function(dt) {
    for (node in this.nodes) {
        this.nodes[node].updatePhysics(this, dt);
    }

    for (node in this.nodes) {
        this.nodes[node].commitUpdate();
        this.geometry.vertices[node].copy(this.nodes[node].pos.ol);
    }

    this.geometry.verticesNeedUpdate = true;
}

Cloth.prototype.nodeIndex = function(index) {
    return index.y * this.density + index.x;
}

Cloth.prototype.nodeAtIndex = function(index) {
    return this.nodes[this.nodeIndex(index)];
}

Cloth.prototype.isValid = function(index) {
    //console.log("checking " + index.x + ", " + index.y);
    return (index.x >= 0 && index.x < this.density &&
            index.y >= 0 && index.y < this.density);
}

// TODO: Make this create a parametric geometry instead
Cloth.prototype.initScene = function(scene) {
    scene.add(this.mesh);
}

function clothGeometryFunc(cloth) {
    return function(v, u) {
        let index = {x: Math.floor(u * (cloth.density - 1)),
                     y: Math.floor(v * (cloth.density - 1))};
        return cloth.nodeAtIndex(index).pos.ol;
    };
}
