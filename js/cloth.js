const MAX_FRAME_TIME = 0.1;

var frame_ct = 0, total_frame_time = 0;
var framerate_elem;

var renderer, scene, camera;
var cloth, light;

var prev_time = 0;

function maximizeRendererSize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.onload  = function() {
    cloth = new Cloth(1, 4, 0.25, 1);

    framerate_elem = document.getElementById("fps-counter");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,
                                         0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    maximizeRendererSize();
    renderer.domElement.id = "rendering-output";
    document.body.appendChild(renderer.domElement);

    light    = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(cloth.nodes[0].mesh);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    camera.position.z = 5;

    animate(0);
}

window.onresize = maximizeRendererSize;

function animate(curr_time) {
    dt = (curr_time - prev_time) / 1000;
    prev_time = curr_time;

    /* Run forward the simulation if we were tabbed out or if the last
     * frame just took a really long time */
    while (dt > MAX_FRAME_TIME) {
        cloth.updatePhysics(MAX_FRAME_TIME);
        dt -= MAX_FRAME_TIME;
    }

    cloth.updatePhysics(dt);

    renderer.render(scene, camera);

    /* Show a frame rate */
    frame_ct++;
    total_frame_time += dt;
    if (total_frame_time > 1.0) {
        let frame_rate = frame_ct / total_frame_time;
        framerate_elem.innerHTML = "FPS: " + frame_rate.toFixed(1);
        total_frame_time = 0;
        frame_ct = 0;
    }

    requestAnimationFrame(animate);
}
