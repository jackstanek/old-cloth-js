const MAX_FRAME_TIME = 0.25;

var frame_ct = 0, total_frame_time = 0;
var framerate_elem;

var renderer, scene, camera, controls;
var cloth_inst, light;

var prev_time = 0;

function maximizeRendererSize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

window.onload  = function() {
    cloth_inst = new Cloth(0.25, 300, 1, 4, 20);

    framerate_elem = document.getElementById("fps-counter");

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,
                                         0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    maximizeRendererSize();
    renderer.domElement.id = "rendering-output";
    document.body.appendChild(renderer.domElement);
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    light    = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 2, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    camera.position.z = 5;

    cloth_inst.initScene(scene);

    animate(0);
}

window.onresize = maximizeRendererSize;

function animate(curr_time) {
    requestAnimationFrame(animate);
    dt = (curr_time - prev_time) / 1000;
    prev_time = curr_time;

    /* Run forward the simulation if we were tabbed out or if the last
     * frame just took a really long time */
    if (dt > MAX_FRAME_TIME) {
        return;
    }

    cloth_inst.updatePhysics(dt);

    controls.update();
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
}
