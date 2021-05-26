//VRM 3Dモデルの両手を下ろしてTポーズを解除してみました
//
//以下のサイト、コードを参考にさせていただきました
//
//ピクシブのエンジニアと「Three.jsでVTuberになろう」というテーマでハンズオンを開催しました
//https://blog.camph.net/event/pixiv-2019/
//
//【ピクシブ】ハンズオン：Three.jsでVTuberになろう 
//https://camphor.connpass.com/event/143692/
//
//three-vrm-vtuber
//https://github.com/FMS-Cat/three-vrm-vtuber
//https://glitch.com/@FMS-Cat/three-vrm-vtuber
//
//GitHub
//https://github.com/pixiv/three-vrm/
//
//Examples
//https://pixiv.github.io/three-vrm/examples/
//https://pixiv.github.io/three-vrm/examples/basic.html
//
//
//3D グラフィックス初心者が Web で VRoid をアニメーションさせてみた
//https://qiita.com/blachocolat/items/2e16eb78328b7997de3c
//
//@pixiv/three-vrm` example
//https://codepen.io/blachocolat/pen/ExxGoLe
//

// renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
document.body.appendChild( renderer.domElement );

// camera
const camera = new THREE.PerspectiveCamera( 30.0, window.innerWidth / window.innerHeight, 0.1, 20.0 );
camera.position.set( 0.0, 1.0, 5.0 );

// camera controls
const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.screenSpacePanning = true;
controls.target.set( 0.0, 1.0, 0.0 );
controls.update();

// scene
const scene = new THREE.Scene();

// light
const light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1.0, 1.0, 1.0 ).normalize();
scene.add( light );

// gltf and vrm
const loader = new THREE.GLTFLoader();
loader.crossOrigin = 'anonymous';
loader.load(

	// URL of the VRM you want to load
	// 'https://rawcdn.githack.com/pixiv/three-vrm/63e9e5d48e317b3ab079c31e0d84e3ee02ada2d7/examples/models/three-vrm-girl.vrm',
		'./js/resources/kazu.vrm',

	// called when the resource is loaded
	( gltf ) => {

		// calling this function greatly improves the performance
		THREE.VRMUtils.removeUnnecessaryJoints( gltf.scene );

		// generate VRM instance from gltf
		THREE.VRM.from( gltf ).then( ( vrm ) => {

			console.log( vrm );
			scene.add( vrm.scene );

			vrm.humanoid.getBoneNode( THREE.VRMSchema.HumanoidBoneName.Hips ).rotation.y = Math.PI;

			// bones
			//両手を下ろしてTポーズを解除
			vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm).rotation.z = Math.PI / 2 - 0.3
			vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperArm).rotation.z = -(Math.PI / 2 - 0.3)
			vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftHand).rotation.z = 0.1
			vrm.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightHand).rotation.z = -0.1

		} );

	},

	// called while loading is progressing
	( progress ) => console.log( 'Loading model...', 100.0 * ( progress.loaded / progress.total ), '%' ),

	// called when loading has errors
	( error ) => console.error( error )

);

// helpers
const gridHelper = new THREE.GridHelper( 10, 10 );
scene.add( gridHelper );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

function animate() {

	requestAnimationFrame( animate );

	renderer.render( scene, camera );

}

//リサイズイベント発生時に実行
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

animate();