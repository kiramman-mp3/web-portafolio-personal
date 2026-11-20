import * as THREE from 'three';

/**
 * Valle de Tungurahua en low-poly, generado por código (sin modelos ni texturas externas).
 * El recorrido baja de las nubes al volcán y sigue por el valle hasta cada proyecto:
 * las acequias de La Jones, Ambato (Karen, nómina y la UTA) y la cancha de Quero.
 *
 * La página solo le dice en qué punto del recorrido está (setJourney) y qué parada resaltar
 * (setActive); la cámara se acerca a ese punto con amortiguación en cada cuadro.
 */

export type ValleyMode = 'journey' | 'ambient';

interface Keyframe {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
  /** 0 = tarde, 1 = noche cerrada */
  night: number;
}

/** Un fotograma por capítulo de la página de inicio, en el mismo orden. */
export const KEYFRAMES: Keyframe[] = [
  { id: 'valle', position: [0, 175, 300], target: [0, 70, -150], night: 0 },
  { id: 'sobre-mi', position: [150, 92, 10], target: [0, 55, -150], night: 0.1 },
  { id: 'jones', position: [-28, 24, 8], target: [-55, 2, -30], night: 0.3 },
  { id: 'karen', position: [12, 24, 84], target: [37, 5, 54], night: 0.45 },
  { id: 'nomina', position: [96, 40, 118], target: [58, 9, 72], night: 0.55 },
  { id: 'lms', position: [118, 40, 50], target: [70, 5, 30], night: 0.65 },
  { id: 'promocion', position: [70, 36, -8], target: [82, 5, 44], night: 0.7 },
  { id: 'quero', position: [-14, 22, 158], target: [-45, 1, 122], night: 0.85 },
  { id: 'mas', position: [-150, 95, 230], target: [0, 10, 20], night: 0.9 },
  { id: 'educacion', position: [130, 60, 120], target: [74, 8, 36], night: 0.95 },
  { id: 'contacto', position: [0, 120, 320], target: [0, 30, -40], night: 1 },
];

const VOLCANO = new THREE.Vector2(0, -150);

/** Paradas con terreno aplanado: [x, z, radio]. */
const PADS: [number, number, number][] = [
  [-55, -30, 18], // La Jones
  [52, 55, 48], // Ambato
  [-45, 122, 22], // Quero
];

// —— Ruido determinista para el terreno ——
function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

function fbm(x: number, y: number): number {
  let sum = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < 4; i++) {
    sum += amp * valueNoise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2;
  }
  return sum;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Curso del río Pastaza/Ambato simplificado: x en función de z. */
function riverX(z: number): number {
  return 18 * Math.sin(z * 0.018) + 4;
}

/** Altura del terreno en (x, z). Las paradas quedan planas para apoyar las construcciones. */
export function terrainHeight(x: number, z: number): number {
  const d = Math.hypot(x - VOLCANO.x, z - VOLCANO.y);
  const cone = 100 * Math.pow(1 - smoothstep(0, 135, d), 1.35);
  const crater = -9 * (1 - smoothstep(0, 11, d));
  const ridges = 34 * smoothstep(80, 190, Math.abs(x - riverX(z))) * (0.6 + 0.8 * fbm(x * 0.02, z * 0.02));
  const rolling = 7 * fbm(x * 0.035 + 10, z * 0.035);
  const river = -4 * (1 - smoothstep(0, 9, Math.abs(x - riverX(z))));
  let h = cone + crater + ridges + rolling + river;

  for (const [px, pz, r] of PADS) {
    const w = 1 - smoothstep(r * 0.7, r * 1.25, Math.hypot(x - px, z - pz));
    h = h * (1 - w) + 2 * w;
  }
  return h;
}

/** Material que se enciende con la noche y al resaltar su parada. */
interface Glow {
  stop: string;
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
  light?: THREE.PointLight;
  level: number;
}

export class ValleyWorld {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(50, 1, 0.5, 2000);
  private readonly clock = new THREE.Clock();

  private readonly camPos = new THREE.Vector3(...KEYFRAMES[0].position);
  private readonly camTarget = new THREE.Vector3(...KEYFRAMES[0].target);
  private readonly wantPos = new THREE.Vector3();
  private readonly wantTarget = new THREE.Vector3();

  private journey = 0;
  private active: string | null = null;
  private mode: ValleyMode = 'ambient';
  private night = 0;

  private readonly glows: Glow[] = [];
  private readonly sun = new THREE.DirectionalLight(0xffd2a1, 2.2);
  private readonly hemi = new THREE.HemisphereLight(0xbfd9ea, 0x2a3a22, 1.1);
  private readonly sky: THREE.ShaderMaterial;
  private readonly stars: THREE.PointsMaterial;
  private readonly smoke: THREE.Mesh[] = [];
  private readonly water: THREE.MeshStandardMaterial[] = [];
  private readonly windows: THREE.MeshBasicMaterial;
  private readonly clouds = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x8a8a8a, flatShading: true, transparent: true, opacity: 0.95 });
  private disposed = false;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    this.scene.fog = new THREE.Fog(0xe9b48f, 160, 760);

    this.sun.position.set(-200, 160, 120);
    this.scene.add(this.sun, this.hemi);

    this.sky = this.buildSky();
    this.stars = this.buildStars();
    this.buildTerrain();
    this.buildRiver();
    this.buildForest();
    this.buildClouds();
    this.buildSmoke();
    this.buildJones();
    this.windows = this.buildAmbato();
    this.buildUta();
    this.buildQuero();

    this.resize();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  /** Posición continua en el recorrido: 2.5 = a medio camino entre el capítulo 2 y el 3. */
  setJourney(value: number): void {
    this.journey = Math.min(KEYFRAMES.length - 1, Math.max(0, value));
  }

  setActive(stop: string | null): void {
    this.active = stop;
  }

  setMode(mode: ValleyMode): void {
    this.mode = mode;
  }

  resize(): void {
    const canvas = this.renderer.domElement;
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    // En pantallas verticales se abre el ángulo para que el valle no quede recortado
    this.camera.fov = w / h < 1 ? 68 : 50;
    this.camera.updateProjectionMatrix();
  }

  dispose(): void {
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.scene.traverse(obj => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach(m => {
        (m as THREE.MeshStandardMaterial).map?.dispose();
        m.dispose();
      });
    });
    this.renderer.dispose();
  }

  // —— Bucle ——

  private tick(): void {
    if (this.disposed) return;
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;

    let wantNight: number;
    if (this.mode === 'journey') {
      const i = Math.floor(this.journey);
      const j = Math.min(i + 1, KEYFRAMES.length - 1);
      const f = smoothstep(0, 1, this.journey - i);
      const a = KEYFRAMES[i], b = KEYFRAMES[j];
      this.wantPos.fromArray(a.position).lerp(new THREE.Vector3(...b.position), f);
      this.wantTarget.fromArray(a.target).lerp(new THREE.Vector3(...b.target), f);
      wantNight = a.night + (b.night - a.night) * f;
    } else {
      // Fondo del resto del sitio: vista del valle de noche, girando despacio
      const angle = time * 0.02;
      this.wantPos.set(Math.sin(angle) * 240, 88, 150 + Math.cos(angle) * 130);
      this.wantTarget.set(0, 25, -30);
      wantNight = 0.92;
    }

    const k = 1 - Math.exp(-dt * 3);
    this.camPos.lerp(this.wantPos, k);
    this.camTarget.lerp(this.wantTarget, k);
    this.night += (wantNight - this.night) * k;
    // Leve vaivén, como si la cámara flotara
    this.camera.position.set(this.camPos.x, this.camPos.y + Math.sin(time * 0.6) * 0.6, this.camPos.z);
    this.camera.lookAt(this.camTarget);

    this.applyTimeOfDay(time);
    this.animateSmoke(dt);

    this.renderer.render(this.scene, this.camera);
  }

  private applyTimeOfDay(time: number): void {
    const n = this.night;
    const day = new THREE.Color(0xffd2a1), dusk = new THREE.Color(0x6d7fb8);
    this.sun.color.copy(day).lerp(dusk, n);
    this.sun.intensity = 2.2 - 1.9 * n;
    this.hemi.intensity = 1.1 - 0.75 * n;

    const top = new THREE.Color(0x4a7fc0).lerp(new THREE.Color(0x050a18), n);
    const horizon = new THREE.Color(0xf2b48a).lerp(new THREE.Color(0x1b2440), n);
    this.sky.uniforms['topColor'].value.copy(top);
    this.sky.uniforms['horizonColor'].value.copy(horizon);
    (this.scene.fog as THREE.Fog).color.copy(horizon);
    this.stars.opacity = smoothstep(0.35, 0.9, n);

    for (const g of this.glows) {
      const isActive = this.active === g.stop;
      const want = isActive ? 1.6 : 0.25 + 0.75 * n;
      g.level += (want - g.level) * 0.06;
      if (g.material instanceof THREE.MeshStandardMaterial) g.material.emissiveIntensity = g.level;
      else g.material.opacity = Math.min(1, g.level);
      if (g.light) g.light.intensity = (isActive ? 900 : 200 * n) * Math.min(1, g.level);
    }
    this.windows.opacity = 0.9 * smoothstep(0.35, 0.9, n);
    this.clouds.opacity = 0.95 - 0.8 * n;
    this.clouds.emissive.setScalar(0.54 * (1 - n));

    // El agua de las acequias late despacio
    for (const w of this.water) w.emissiveIntensity = 0.35 + 0.25 * Math.sin(time * 2) + 0.6 * n;
  }

  private animateSmoke(dt: number): void {
    const crater = terrainHeight(VOLCANO.x, VOLCANO.y);
    for (const puff of this.smoke) {
      puff.position.y += dt * 4;
      puff.position.x += dt * 2.2;
      const life = (puff.position.y - crater) / 70;
      puff.scale.setScalar(4 + life * 14);
      (puff.material as THREE.MeshLambertMaterial).opacity = 0.55 * (1 - life);
      if (life >= 1) {
        puff.position.set(VOLCANO.x + (Math.random() - 0.5) * 6, crater, VOLCANO.y + (Math.random() - 0.5) * 6);
      }
    }
  }

  // —— Construcción de la escena ——

  private buildSky(): THREE.ShaderMaterial {
    const material = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        topColor: { value: new THREE.Color() },
        horizonColor: { value: new THREE.Color() },
      },
      vertexShader: `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 horizonColor;
        varying vec3 vDir;
        void main() {
          float t = pow(clamp(vDir.y, 0.0, 1.0), 0.55);
          gl_FragColor = vec4(mix(horizonColor, topColor, t), 1.0);
        }`,
    });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 32, 16), material);
    sky.renderOrder = -1;
    this.scene.add(sky);
    return material;
  }

  private buildStars(): THREE.PointsMaterial {
    const count = 1400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.85 + 0.15);
      positions.set([
        1300 * Math.sin(phi) * Math.cos(theta),
        1300 * Math.cos(phi),
        1300 * Math.sin(phi) * Math.sin(theta),
      ], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, fog: false });
    this.scene.add(new THREE.Points(geometry, material));
    return material;
  }

  private buildTerrain(): void {
    const geometry = new THREE.PlaneGeometry(900, 900, 180, 180);
    geometry.rotateX(-Math.PI / 2);
    const pos = geometry.attributes['position'] as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const grass = new THREE.Color(0x5b8a3a), field = new THREE.Color(0x8aa64a), rock = new THREE.Color(0x6e5a4b);
    const ash = new THREE.Color(0x4a4442), snow = new THREE.Color(0xf4f6f8), c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
      const patch = fbm(x * 0.05, z * 0.05);
      c.copy(grass).lerp(field, patch > 0.55 ? 0.7 : 0);
      if (h > 26) c.lerp(rock, smoothstep(26, 50, h));
      if (h > 50) c.lerp(ash, smoothstep(50, 72, h));
      if (h > 74) c.lerp(snow, smoothstep(74, 84, h));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const terrain = new THREE.Mesh(
      geometry.toNonIndexed(),
      new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }),
    );
    terrain.geometry.computeVertexNormals();
    this.scene.add(terrain);
  }

  private buildRiver(): void {
    const points: THREE.Vector3[] = [];
    for (let z = -60; z <= 420; z += 12) {
      const x = riverX(z);
      points.push(new THREE.Vector3(x, terrainHeight(x, z) + 0.6, z));
    }
    const material = new THREE.MeshStandardMaterial({ color: 0x3f7fb5, emissive: 0x2f8fd8, flatShading: true, roughness: 0.3 });
    this.water.push(material);
    const river = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 120, 2.2, 5), material);
    river.scale.y = 0.35;
    river.position.y = 0.4;
    this.scene.add(river);
  }

  private buildForest(): void {
    const trunk = new THREE.CylinderGeometry(0.25, 0.35, 1.4, 5);
    trunk.translate(0, 0.7, 0);
    const crown = new THREE.ConeGeometry(1.5, 4, 6);
    crown.translate(0, 3.2, 0);
    const trunks = new THREE.InstancedMesh(trunk, new THREE.MeshStandardMaterial({ color: 0x5a3d2b, flatShading: true }), 1600);
    const crowns = new THREE.InstancedMesh(crown, new THREE.MeshStandardMaterial({ color: 0x2f5d32, flatShading: true }), 1600);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    const shade = new THREE.Color();

    let placed = 0, attempt = 0;
    while (placed < 1600 && attempt < 20000) {
      attempt++;
      const x = (hash(attempt, 1.3) - 0.5) * 600;
      const z = (hash(attempt, 7.9) - 0.5) * 600 + 60;
      const h = terrainHeight(x, z);
      const nearPad = PADS.some(([px, pz, r]) => Math.hypot(x - px, z - pz) < r * 1.3);
      if (h > 40 || nearPad || Math.abs(x - riverX(z)) < 8 || fbm(x * 0.03, z * 0.03) < 0.42) continue;
      const scale = 0.8 + hash(attempt, 3.1) * 1.1;
      m.compose(p.set(x, h, z), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hash(attempt, 5) * 6), s.setScalar(scale));
      trunks.setMatrixAt(placed, m);
      crowns.setMatrixAt(placed, m);
      crowns.setColorAt(placed, shade.setHSL(0.3 + hash(attempt, 9) * 0.06, 0.4, 0.22 + hash(attempt, 11) * 0.1));
      placed++;
    }
    trunks.count = crowns.count = placed;
    this.scene.add(trunks, crowns);
  }

  private buildClouds(): void {
    const material = this.clouds;
    const puff = new THREE.IcosahedronGeometry(1, 1);
    for (let i = 0; i < 46; i++) {
      const cloud = new THREE.Group();
      const parts = 4 + Math.floor(hash(i, 2) * 4);
      for (let p = 0; p < parts; p++) {
        const mesh = new THREE.Mesh(puff, material);
        mesh.position.set((p - parts / 2) * 7 + hash(i, p) * 4, hash(p, i) * 4, hash(i + p, 3) * 6);
        mesh.scale.setScalar(6 + hash(i, p + 9) * 6);
        cloud.add(mesh);
      }
      cloud.position.set((hash(i, 21) - 0.5) * 380, 110 + hash(i, 22) * 35, 40 + hash(i, 23) * 260);
      this.scene.add(cloud);
    }
  }

  private buildSmoke(): void {
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const crater = terrainHeight(VOLCANO.x, VOLCANO.y);
    for (let i = 0; i < 26; i++) {
      const material = new THREE.MeshLambertMaterial({ color: 0xd6d0ca, emissive: 0x2a2725, flatShading: true, transparent: true, depthWrite: false });
      const puff = new THREE.Mesh(geometry, material);
      puff.position.set(VOLCANO.x, crater + (i / 26) * 70, VOLCANO.y);
      this.smoke.push(puff);
      this.scene.add(puff);
    }
  }

  /** Pinta un edificio con ventanas que se encienden: devuelve el material para animarlo. */
  private building(stop: string, w: number, h: number, d: number, color: number, glow: number): THREE.Mesh {
    const material = new THREE.MeshStandardMaterial({
      color,
      emissive: glow,
      emissiveIntensity: 0.25,
      emissiveMap: windowTexture(Math.max(1, Math.round(h / 3))),
      flatShading: true,
      roughness: 0.8,
    });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.geometry.translate(0, h / 2, 0);
    this.glows.push({ stop, material, level: 0.25 });
    return mesh;
  }

  private place(obj: THREE.Object3D, x: number, z: number, rotation = 0): void {
    obj.position.set(x, terrainHeight(x, z), z);
    obj.rotation.y = rotation;
    this.scene.add(obj);
  }

  private stopLight(stop: string, x: number, z: number, color: number, height = 12): void {
    const light = new THREE.PointLight(color, 0, 90, 1.6);
    light.position.set(x, terrainHeight(x, z) + height, z);
    this.scene.add(light);
    const glow = this.glows.find(g => g.stop === stop);
    if (glow && !glow.light) glow.light = light;
  }

  private buildJones(): void {
    // Casas de la comunidad con techos a dos aguas
    const houses: [number, number, number][] = [[-62, -36, 0.3], [-50, -40, -0.2], [-66, -22, 1.2], [-44, -24, 0.6]];
    for (const [x, z, r] of houses) {
      const house = new THREE.Group();
      house.add(this.building('jones', 5, 3.2, 4, 0xe8dcc8, 0xffc070));
      const roof = new THREE.Mesh(new THREE.ConeGeometry(4.2, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0xa4472f, flatShading: true }));
      roof.position.y = 4.4;
      roof.rotation.y = Math.PI / 4;
      house.add(roof);
      this.place(house, x, z, r);
    }

    // Acequias: canales de agua que bajan del cerro hacia los lotes
    const material = new THREE.MeshStandardMaterial({ color: 0x4ca3d9, emissive: 0x38b6ff, flatShading: true });
    this.water.push(material);
    for (let k = 0; k < 4; k++) {
      const points: THREE.Vector3[] = [];
      for (let t = 0; t <= 10; t++) {
        const x = -95 + t * 9 + Math.sin(t + k) * 2;
        const z = -48 + k * 9 + Math.sin(t * 0.7 + k) * 3;
        points.push(new THREE.Vector3(x, terrainHeight(x, z) + 0.4, z));
      }
      this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 40, 0.5, 4), material));
    }
    this.stopLight('jones', -55, -30, 0xffc070);
  }

  private buildAmbato(): THREE.MeshBasicMaterial {
    // Supermercado Karen: nave ancha con letrero
    const karen = new THREE.Group();
    karen.add(this.building('karen', 16, 6, 10, 0xf1ece4, 0xffd27a));
    const sign = new THREE.Mesh(new THREE.BoxGeometry(10, 2.2, 0.4), new THREE.MeshBasicMaterial({ color: 0xe8423c, transparent: true }));
    sign.position.set(0, 7.4, 5.2);
    karen.add(sign);
    this.glows.push({ stop: 'karen', material: sign.material as THREE.MeshBasicMaterial, level: 0.25 });
    this.place(karen, 35, 55, 0.2);
    this.stopLight('karen', 35, 60, 0xffd27a);

    // Oficina de nómina: torre angosta
    this.place(this.building('nomina', 7, 22, 7, 0xcdd6de, 0x9fd2ff), 58, 72, -0.3);
    this.stopLight('nomina', 58, 76, 0x9fd2ff, 26);

    // Resto de la ciudad: bloques con ventanas que se encienden con la noche
    const block = new THREE.BoxGeometry(1, 1, 1);
    block.translate(0, 0.5, 0);
    const blocks = new THREE.InstancedMesh(block, new THREE.MeshStandardMaterial({ color: 0xd9cfc2, flatShading: true }), 140);
    const windows = new THREE.MeshBasicMaterial({ color: 0xffc36b, transparent: true, opacity: 0.2 });
    const lit = new THREE.InstancedMesh(block, windows, 140);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3();
    let n = 0;
    for (let i = 0; n < 140 && i < 600; i++) {
      const x = 52 + (hash(i, 41) - 0.5) * 95, z = 55 + (hash(i, 42) - 0.5) * 95;
      const busy = [[35, 55, 16], [58, 72, 11], [70, 30, 16], [82, 44, 14]].some(([bx, bz, r]) => Math.hypot(x - bx, z - bz) < r);
      if (busy || Math.hypot(x - 52, z - 55) > 46) continue;
      const h = 2 + hash(i, 43) * 5;
      const y = terrainHeight(x, z);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hash(i, 44) * 0.6);
      const w = 2.5 + hash(i, 45) * 2, d = 2.5 + hash(i, 46) * 2;
      blocks.setMatrixAt(n, m.compose(p.set(x, y, z), q, s.set(w, h, d)));
      // Franja de ventanas apenas por fuera de la fachada; solo se ve de noche
      lit.setMatrixAt(n, m.compose(p.set(x, y + h * 0.4, z), q, s.set(w * 1.03, h * 0.3, d * 1.03)));
      n++;
    }
    blocks.count = lit.count = n;
    this.scene.add(blocks, lit);
    return windows;
  }

  private buildUta(): void {
    // Campus de la UTA: el LMS y el trámite de promoción docente
    this.place(this.building('lms', 18, 9, 9, 0xe6e0d6, 0x8fe3c4), 70, 30, 0.1);
    const library = new THREE.Group();
    library.add(this.building('promocion', 14, 7, 10, 0xd8c7a8, 0xf5c27a));
    const columns = new THREE.MeshStandardMaterial({ color: 0xf3ede2, flatShading: true });
    for (let c = 0; c < 5; c++) {
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 7, 6), columns);
      column.position.set(-5 + c * 2.5, 3.5, 5.6);
      library.add(column);
    }
    this.place(library, 82, 44, -0.15);
    this.stopLight('lms', 70, 34, 0x8fe3c4);
    this.stopLight('promocion', 82, 48, 0xf5c27a);
  }

  private buildQuero(): void {
    const field = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 18),
      new THREE.MeshStandardMaterial({ map: pitchTexture(), roughness: 1 }),
    );
    field.rotation.x = -Math.PI / 2;
    field.position.set(-45, terrainHeight(-45, 122) + 0.15, 122);
    field.rotation.z = 0.25;
    this.scene.add(field);

    // Torres de iluminación del estadio
    const pole = new THREE.CylinderGeometry(0.3, 0.4, 12, 6);
    pole.translate(0, 6, 0);
    const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x8a8f96, flatShading: true });
    for (const [dx, dz] of [[-16, -11], [16, -11], [-16, 11], [16, 11]]) {
      const tower = new THREE.Group();
      tower.add(new THREE.Mesh(pole, poleMaterial));
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 0.6), new THREE.MeshBasicMaterial({ color: 0xfff4d6, transparent: true }));
      lamp.position.y = 12.4;
      tower.add(lamp);
      this.glows.push({ stop: 'quero', material: lamp.material as THREE.MeshBasicMaterial, level: 0.25 });
      this.place(tower, -45 + dx, 122 + dz, 0.25);
    }
    // Graderío
    this.place(this.building('quero', 22, 3, 3, 0xbfc5cc, 0xfff4d6), -49, 136, 0.25);
    this.stopLight('quero', -45, 122, 0xfff4d6, 16);
  }
}

/** Textura de ventanas: filas de rectángulos claros sobre negro, para usar como emissiveMap. */
function windowTexture(rows: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, 64, 64);
  const rowH = 64 / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 4; c++) {
      if (hash(r, c + rows) < 0.2) continue;
      ctx.fillStyle = '#fff';
      ctx.fillRect(4 + c * 15, r * rowH + rowH * 0.25, 9, rowH * 0.45);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Cancha de fútbol con sus líneas. */
function pitchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 180;
  const ctx = canvas.getContext('2d')!;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = i % 2 ? '#3f8a3a' : '#479a41';
    ctx.fillRect(i * 28, 0, 28, 180);
  }
  ctx.strokeStyle = '#f1f5ef';
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 264, 164);
  ctx.beginPath();
  ctx.moveTo(140, 8);
  ctx.lineTo(140, 172);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(140, 90, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeRect(8, 50, 34, 80);
  ctx.strokeRect(238, 50, 34, 80);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
