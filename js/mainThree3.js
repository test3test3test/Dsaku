
class VRMPlayer {
    constructor (src) {
      this.animate = this.onAnimate.bind(this)
  
      this.clock = new THREE.Clock()
      this.basePosition = new THREE.Vector3()
  
      // renderer
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      document.body.appendChild(this.renderer.domElement)
  
      // camera
      this.camera = new THREE.PerspectiveCamera(15.0, window.innerWidth / window.innerHeight, 0.1, 100.0)
      this.camera.position.set(0.0, 0.75, 7.5)
  
      // camera controls
      const controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
      controls.screenSpacePanning = true
      controls.target.set(0.0, 1.25, 0.0)
      controls.update()
  
      // scene
      this.scene = new THREE.Scene()
  
      // light
      const light = new THREE.DirectionalLight(0xffffff)
      light.position.set(1.0, 1.0, 1.0).normalize()
      this.scene.add(light)
  
      // loader
      const loader = new THREE.GLTFLoader()

      const loader2 = new THREE.CubeTextureLoader();
      const texture = loader2.load([
          './js/resources/posx.jpg',
          './js/resources/negx.jpg',
          './js/resources/posy.jpg',
          './js/resources/negy.jpg',
          './js/resources/posz.jpg',
          './js/resources/negz.jpg',
          // './js/resources/MegaSunRight.jpg',
          // './js/resources/MegaSunLeft.jpg',
          // './js/resources/MegaSunTop.jpg',
          // './js/resources/MegaSunBottom.jpg',
          // './js/resources/MegaSunFront.jpg',
          // './js/resources/MegaSunBack.jpg',
      ]);
      this.scene.background = texture;

      loader.crossOrigin = 'anonymous'
      loader.load(src, async (gltf) => {
        // generate a VRM instance from gltf
        this.model = await THREE.VRM.from(gltf)
        this.model.scene.rotation.set(Math.PI, 0, Math.PI)
        this.basePosition.copy(this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).position)
        
        // bones
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperArm).rotation.z = Math.PI / 2 - 0.3
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperArm).rotation.z = -(Math.PI / 2 - 0.3)
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftHand).rotation.z = 0.1
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightHand).rotation.z = -0.1
  
        // keyframe animations
        const bones = [
          THREE.VRMSchema.HumanoidBoneName.Neck
        ].map((boneName) => {
          return this.model.humanoid.getBoneNode(boneName)
        })
        const clip = THREE.AnimationClip.parseAnimation({
          hierarchy: [{
            keys: [{
              rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
              time: 0.0,
            }, {
              rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
              time: 4.2,
            }, {
              rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 16, 0, 0)).toArray(),
              time: 4.4,
            }, {
              rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
              time: 4.6,
            }, {
              rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 16, 0, 0)).toArray(),
              time: 4.8,
            }, {
              rot: new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0)).toArray(),
              time: 5.0,
            }]
          }]
        }, bones)
        clip.tracks.some((track) => {
          track.name = track.name.replace(/^\.bones\[([^\]]+)\].(position|quaternion|scale)$/, '$1.$2')
        })
        this.mixer = new THREE.AnimationMixer(this.model.scene)
        this.mixer.clipAction(clip).play()
        
        this.scene.add(this.model.scene)
        this.animate()
      })
    }
  
    get waitingValue () {
      return (1 - (Math.sin(this.clock.elapsedTime * 4/5) ** 4)) * Math.PI / 32
    }
  
    get blinkValue () {
      return (Math.sin(this.clock.elapsedTime * 1/3) ** 1024) +
        (Math.sin(this.clock.elapsedTime * 4/7) ** 1024)
    }
  
    get speakAValue () {
      return (Math.sin(this.clock.elapsedTime * 11) ** 4) * 0.7
    }
  
    get speakOValue () {
      return (Math.sin(this.clock.elapsedTime * 7) ** 4) * 0.5
    }
  
    onAnimate() {
      const delta = this.clock.getDelta()
  
      if (this.model) {
        this.model.scene.rotation.set(Math.PI, 0, Math.PI)
  
        // bone animations
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Spine).rotation.x =
          0.05 - 0.5 * this.waitingValue
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftUpperLeg).rotation.x =
          this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightUpperLeg).rotation.x =
            this.waitingValue
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg).rotation.x =
          this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightLowerLeg).rotation.x =
            -2 * this.waitingValue
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot).rotation.x =
          this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.RightFoot).rotation.x =
            this.waitingValue
        this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.Hips).position.y =
          this.basePosition.y +
          (this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg).position.y +
            this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot).position.y) -
          (this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftLowerLeg).position.y * Math.cos(this.waitingValue) +
            this.model.humanoid.getBoneNode(THREE.VRMSchema.HumanoidBoneName.LeftFoot).position.y * Math.cos(this.waitingValue))
  
        // blend shape animations
        this.model.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Blink, this.blinkValue)
        // this.model.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.A, this.speakAValue)
        // this.model.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.U, this.speakOValue)
        this.model.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Fun, 0.5)
        this.model.blendShapeProxy.update()
  
        this.model.update(delta)
      }
  
      if (this.mixer) {
        this.mixer.update(delta)
      }
  
      this.renderer.render(this.scene, this.camera)
      window.requestAnimationFrame(this.animate)
    }
  }
  
  const vrmPlayer1 = new VRMPlayer('./js/resources/D-saku.vrm');
  // const vrmPlayer2 = new VRMPlayer('./js/resources/hachi.vrm');
  // const vrmPlayer3 = new VRMPlayer('./js/resources/yukki.vrm');
  // const vrmPlayer4 = new VRMPlayer('./js/resources/yui.vrm');
  // const vrmPlayer5 = new VRMPlayer('./js/resources/tomo-rin.vrm');
  // const vrmPlayer6 = new VRMPlayer('./js/resources/kazu.vrm');
  // const vrmPlayer7 = new VRMPlayer('./js/resources/ricky.vrm');
  // const vrmPlayer8 = new VRMPlayer('./js/resources/okabe.vrm');
  // const vrmPlayer9 = new VRMPlayer('./js/resources/makise.vrm');
  // const vrmPlayer10 = new VRMPlayer('./js/resources/tomori nao.vrm');