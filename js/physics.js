function ClothNode(weight) {
    this.weight = weight;
}

function Cloth(node_weight, tension, w, h) {
    this.nodes = new Array();
    this.tension = tension;

    for (var j = 0; j < h; j++) {
        for (var i = 0; i < w; i++) {
            nodes[i][j] = new ClothNode(weight);
        }
    }
}
