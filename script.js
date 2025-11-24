document.addEventListener('DOMContentLoaded', () => {
    const fileList = document.getElementById('file-list');
    const viewerContainer = document.getElementById('viewer-container');
    const canvas = document.getElementById('viewer');

    let scene, camera, renderer, controls, currentObject;

    function initViewer() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xeeeeee);

        camera = new THREE.PerspectiveCamera(75, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        window.addEventListener('resize', onWindowResize, false);

        animate();
    }

    function onWindowResize() {
        camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    function loadModel(file) {
        console.log(`Loading model: ${file}`);
        if (currentObject) {
            scene.remove(currentObject);
        }

        const loader = new THREE.OBJLoader();
        loader.load(
            `uploads/${file}`,
            (object) => {
                console.log('Model loaded successfully:', object);
                currentObject = object;
                scene.add(currentObject);
                centerAndScale(currentObject);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            (error) => {
                console.error('An error happened', error);
            }
        );
    }

    function centerAndScale(object) {
        const bbox = new THREE.Box3().setFromObject(object);
        const center = bbox.getCenter(new THREE.Vector3());
        const size = bbox.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;

        object.position.x = -center.x * scale;
        object.position.y = -center.y * scale;
        object.position.z = -center.z * scale;
        object.scale.set(scale, scale, scale);
    }

    const files = ['VWBug.obj', 'boss.obj', 'boss8.obj', 'david_remesh.obj'];

    if (files.length === 0) {
        fileList.innerHTML = '<p>No OBJ files found</p>';
    } else {
        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');

            const fileName = document.createElement('span');
            fileName.textContent = file;
            
            const downloadLink = document.createElement('a');
            downloadLink.href = `uploads/${file}`;
            downloadLink.textContent = 'Download';
            downloadLink.classList.add('download-link');
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(downloadLink);
            fileList.appendChild(fileItem);
        });

        fileList.addEventListener('click', (event) => {
            if (event.target.tagName === 'SPAN') {
                loadModel(event.target.textContent);
            }
        });

        // Load first available model as default
        if (files.includes('boss.obj')) {
            loadModel('boss.obj');
        } else if (files.length > 0) {
            loadModel(files[0]);
        }
    }

    initViewer();
});