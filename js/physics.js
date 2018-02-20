/* Some constants. GRAV_ACC is not really a force since it is
 * constant for every object. */
const GRAV_ACC   = new THREE.Vector3(0, -10, 0);

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
    this.vel      = new UpdatableVec3();
    this.dv       = new THREE.Vector3();
    this.acc      = new UpdatableVec3();
    this.mesh     = new THREE.Mesh(new THREE.SphereGeometry(0.1),
                                   DEFAULT_MATERIAL);
    this.mesh.position.copy(this.pos.ol);
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
            total_forces.add(this.forceFrom(neighbor_index));
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
    this.mesh.position.copy(this.pos.ol);
}

ClothNode.prototype.forceFrom = function(neighbor_index) {
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
    this.w          = size;
    this.h          = size;
    this.density    = density;
    this.spring_len = size / density;

    for (let i = 0; i < this.w * this.h; i++) {
        let x = i % this.w, y = Math.floor(i / this.h);
        this.nodes[i] = new ClothNode(node_mass, x, y,
                                      new THREE.Vector3(this.spring_len * x - this.w / 2,
                                                        this.h / 2 - this.spring_len * y, 0));
    }
}

Cloth.prototype.updatePhysics = function(dt) {
    for (node in this.nodes) {
        this.nodes[node].updatePhysics(this, dt);
    }

    for (node in this.nodes) {
        this.nodes[node].commitUpdate();
    }
}

Cloth.prototype.nodeIndex = function(index) {
    return index.y * this.w + index.x;
}

Cloth.prototype.nodeAtIndex = function(index) {
    return this.nodes[this.nodeIndex(index)];
}

Cloth.prototype.isValid = function(index) {
    return (index.x >= 0 && index.x < this.w &&
            index.y >= 0 && index.y < this.h);
}

// TODO: Make this create a parametric geometry instead
Cloth.prototype.initScene = function(scene) {
    for (let i = 0; i < this.nodes.length; i++) {
        scene.add(this.nodes[i].mesh);
    }
}
