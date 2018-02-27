function MusicalString(mass, k, damping, node_ct, length, tension) {
    this.mass       = mass;
    this.k          = k;
    this.damping    = damping;
    this.length     = length;
    this.spring_len = tension * length / (node_ct - 1);
    this.nodes      = new Array();
    this.meshes     = new Array();

    for (let i = 0; i < node_ct; i++) {
        this.nodes[i] = new ClothNode(mass, i, 0, );
    }
}
