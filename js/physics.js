/* Some constants. GRAV_ACC is not really a force since it is
 * constant for every object. */
const GRAV_ACC   = new THREE.Vector3(0, -10, 0);

const DEFAULT_MATERIAL = new THREE.MeshPhongMaterial({color: 0xffffff});

function ClothNode(mass, index, pos, tension, damping) {
    this.mass     = mass;
    this.index    = index;
    this.pos      = pos;
    this.dp       = new THREE.Vector3();
    this.vel      = new THREE.Vector3();
    this.dv       = new THREE.Vector3();
    this.acc      = new THREE.Vector3();
    this.mesh     = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3),
                                   DEFAULT_MATERIAL);
    this.mesh.position.copy(this.pos);
}

ClothNode.prototype.updatePhysics = function(cloth, dt) {
    /* Rotation for fanciness */
    this.mesh.rotation.x += dt;
    this.mesh.rotation.y += dt;
    this.mesh.rotation.z += dt;

    /* The top of the thread is pinned in place. */
    if (this.index === 0) {
        return;
    }

    //var neighbors = cloth.getNeighbors(this.x, this.y);
    // TODO: generalize force calculations
    var total_forces = new THREE.Vector3();

    // Spring restorative forces
    // This first force we know will always exist. (the spring force from above)
    var above_spring = new THREE.Vector3();
    above_spring.copy(this.pos);
    above_spring.sub(cloth.nodes[this.index - 1].pos);
    above_spring.negate();
    var above_spring_len = above_spring.length();
    /* Add in the spring force (Hooke's Law) */
    total_forces.add(above_spring
                     .normalize()
                     .multiplyScalar(cloth.tension *
                                     (above_spring_len - cloth.spring_len)));

    // Every node except for the last will have a force exerted on it from below
    if (this.index < cloth.nodes.length - 1) {
        var below_spring = new THREE.Vector3();
        below_spring.copy(this.pos);
        below_spring.sub(cloth.nodes[this.index + 1].pos);
        below_spring.negate();
        var below_spring_len = below_spring.length();
        /* Add in the spring force (Hooke's Law) */
        total_forces.add(below_spring
                         .normalize()
                         .multiplyScalar(cloth.tension *
                                         below_spring_len - cloth.spring_len));
    }


    // Damping force
    var tmp_vel = new THREE.Vector3();
    tmp_vel.copy(this.vel);
    tmp_vel.negate();
    total_forces.add(tmp_vel.multiplyScalar(cloth.damping));

    this.acc.copy(total_forces.divideScalar(this.mass));
    this.acc.add(GRAV_ACC);

    /* Do Eulerian integration for velocity */
    this.dv.copy(this.acc);
    this.dv.multiplyScalar(dt);
    this.vel.add(this.dv);

    /* Do Eulerian integration for position */
    this.dp.copy(this.vel);
    this.dp.multiplyScalar(dt);
    this.pos.add(this.dp);

    this.mesh.position.copy(this.pos);
}

/* For now, a Cloth object simply represents a thread, string, or
 * rope-like object. */
function Cloth(node_mass, tension, damping, length) {
    this.nodes      = new Array();
    this.tension    = tension;
    this.damping    = damping;
    this.spring_len = 1; // TODO: Make this adjustable (for size of cloth and so forth)

    for (let i = 0; i < length; i++) {
        this.nodes[i] = new ClothNode(node_mass, i,
                                      new THREE.Vector3(i, length - i, 0));
    }
}

Cloth.prototype.updatePhysics = function(dt) {
    for (node in this.nodes) {
        this.nodes[node].updatePhysics(this, dt);
    }
}

Cloth.prototype.nodeIndex = function(x, y) {
    return y * this.width + x;
}

Cloth.prototype.isValid = function(pos) {
    var x, y;
    [x, y] = pos;

    return (x >= 0 && x < width &&
            y >= 0 && y < height);
}

Cloth.prototype.getNeighbors = function(x, y) {
    if (!isValid([x, y])) {
        return undefined;
    } else {
        return [[x - 1, y],
                [x + 1, y],
                [x, y - 1],
                [x, y + 1]].filter(this.isValid).map(this.nodeIndex);
    }
}

Cloth.prototype.initScene = function(scene) {
    for (let i = 0; i < this.nodes.length; i++) {
        scene.add(this.nodes[i].mesh);
    }
}

Cloth.prototype.clothGeometryFunc = function(u, v) {
    //width

    //return
}
