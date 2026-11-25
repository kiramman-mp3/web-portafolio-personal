import type { Project } from '../../shared/services/projects.service';
import { getProjectCover, getProjectImages } from '../../shared/services/projects.service';

export interface WaveEngineCallbacks {
  onSelectIndex: (index: number) => void;
  onManualTargetIndex?: (index: number) => void;
  onMotionStateChange?: (isMoving: boolean) => void;
  onReady: () => void;
  onError: (reason: string) => void;
}

export interface WaveEngineOptions {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  projects: Project[];
  initialIndex: number;
  reducedMotion: boolean;
  /** Textos dibujados en las tarjetas, en el idioma de la página. */
  labels: WaveCardLabels;
  callbacks: WaveEngineCallbacks;
}

export interface WaveCardLabels {
  status: Record<string, string>;
  photos: string;
}

const S = 3.7;
const BUFFER_COUNT = 12;
const HALF_SPAN = (BUFFER_COUNT * S) / 2;
const DEG2RAD = Math.PI / 180;
const DRAG_MULT = 0.02;
const THROW_MULT = 8;

const CARD_W = 2.22;
const CARD_H = 3.08;
const CARD_R = 0.17;

const RAIL_COLORS = [0x2a1418, 0x561d24, 0x3b2226];

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function positiveModulo(n: number, m: number): number {
  if (m <= 0) return 0;
  return ((n % m) + m) % m;
}

function wrap(value: number, min: number, max: number): number {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number {
  const words = text.split(/\s+/).filter(Boolean);
  let line = '';
  let lineCount = 0;
  let curY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lineCount++;
      if (lineCount >= maxLines) {
        let clipped = line;
        while (ctx.measureText(`${clipped}…`).width > maxWidth && clipped.length > 3) {
          clipped = clipped.slice(0, -1);
        }
        ctx.fillText(`${clipped}…`, x, curY);
        return curY + lineHeight;
      }
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

function loadHtmlImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    if (/^https?:\/\//i.test(src)) {
      img.crossOrigin = 'anonymous';
    }
    img.decoding = 'async';
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(() => resolve(img)).catch(() => resolve(img));
      } else {
        resolve(img);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function paintProjectDeckCanvas(
  project: Project,
  index: number,
  total: number,
  coverImg: HTMLImageElement | null,
  labels: WaveCardLabels
): HTMLCanvasElement {
  const W = 720;
  const H = 1000;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Base cosmic obsidian surface matching madebyjohan.xyz
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#180b0e');
  bg.addColorStop(0.52, '#110709');
  bg.addColorStop(1, '#1e0c10');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle crimson-rose radial glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.22, 30, W * 0.5, H * 0.28, W * 0.78);
  glow.addColorStop(0, 'rgba(242, 87, 91, 0.22)');
  glow.addColorStop(0.55, 'rgba(246, 185, 168, 0.06)');
  glow.addColorStop(1, 'rgba(10, 4, 5, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Restrained central hairline stringer behind content
  ctx.fillStyle = 'rgba(237, 228, 226, 0.06)';
  ctx.fillRect(W / 2 - 1, 30, 2, H - 60);

  // Outer fine frame
  roundRectPath(ctx, 24, 24, W - 48, H - 48, 32);
  ctx.strokeStyle = 'rgba(237, 228, 226, 0.16)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Header metadata row (index + status dot)
  const numLabel = `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  ctx.font = '500 22px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillStyle = 'rgba(237, 228, 226, 0.6)';
  ctx.fillText(numLabel, 50, 78);

  const statusColor =
    project.status === 'completado'
      ? '#34d399'
      : project.status === 'en-progreso'
        ? '#fbbf24'
        : '#60a5fa';
  const statusLabel = (labels.status[project.status] ?? project.status).toUpperCase();

  ctx.font = '600 18px "IBM Plex Mono", ui-monospace, monospace';
  const stWidth = ctx.measureText(statusLabel).width;
  const pillW = stWidth + 44;
  const pillX = W - 50 - pillW;
  roundRectPath(ctx, pillX, 52, pillW, 38, 19);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pillX + 18, 71, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = statusColor;
  ctx.fill();
  ctx.fillStyle = 'rgba(237, 228, 226, 0.88)';
  ctx.fillText(statusLabel, pillX + 31, 77);

  // Large crisp project cover artwork frame
  const imgX = 46;
  const imgY = 112;
  const imgW = W - 92;
  const imgH = 440;

  ctx.save();
  roundRectPath(ctx, imgX, imgY, imgW, imgH, 24);
  ctx.clip();

  ctx.fillStyle = '#0c0507';
  ctx.fillRect(imgX, imgY, imgW, imgH);

  if (coverImg) {
    drawCoverImage(ctx, coverImg, imgX, imgY, imgW, imgH);
  } else {
    const fallbackGrad = ctx.createLinearGradient(imgX, imgY, imgX + imgW, imgY + imgH);
    fallbackGrad.addColorStop(0, '#2a1217');
    fallbackGrad.addColorStop(1, '#120709');
    ctx.fillStyle = fallbackGrad;
    ctx.fillRect(imgX, imgY, imgW, imgH);
  }

  // Soft bottom vignette
  const vig = ctx.createLinearGradient(0, imgY + imgH - 96, 0, imgY + imgH);
  vig.addColorStop(0, 'rgba(17, 7, 9, 0)');
  vig.addColorStop(1, 'rgba(17, 7, 9, 0.72)');
  ctx.fillStyle = vig;
  ctx.fillRect(imgX, imgY + imgH - 96, imgW, 96);
  ctx.restore();

  roundRectPath(ctx, imgX, imgY, imgW, imgH, 24);
  ctx.strokeStyle = 'rgba(237, 228, 226, 0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Multi-image indicator if > 1 image
  const imgCount = getProjectImages(project).length;
  if (imgCount > 1) {
    const countTxt = `${imgCount} ${labels.photos}`.toUpperCase();
    ctx.font = '600 18px "IBM Plex Mono", ui-monospace, monospace';
    const cw = ctx.measureText(countTxt).width + 26;
    const cx = imgX + imgW - cw - 16;
    const cy = imgY + imgH - 48;
    roundRectPath(ctx, cx, cy, cw, 34, 17);
    ctx.fillStyle = 'rgba(10, 4, 5, 0.82)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#ede4e2';
    ctx.fillText(countTxt, cx + 13, cy + 23);
  }

  // Restrained crimson-rose divider band
  const accentGrad = ctx.createLinearGradient(50, 0, W - 50, 0);
  accentGrad.addColorStop(0, '#f2575b');
  accentGrad.addColorStop(0.5, '#f6b9a8');
  accentGrad.addColorStop(1, 'rgba(242, 87, 91, 0.15)');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(50, 580, W - 100, 3);

  // Project Title in site editorial serif
  ctx.fillStyle = '#ede4e2';
  ctx.font = 'italic 600 46px "Fraunces", Georgia, serif';
  const curY = wrapCanvasText(ctx, project.title, 50, 642, W - 100, 52, 2);

  // Short Description
  ctx.fillStyle = 'rgba(237, 228, 226, 0.74)';
  ctx.font = '400 24px "IBM Plex Sans", system-ui, sans-serif';
  wrapCanvasText(ctx, project.shortDescription || '', 50, curY + 14, W - 100, 34, 3);

  // Bottom tech pills
  const techs = (project.technologies || []).slice(0, 4);
  let chipX = 50;
  const chipY = H - 90;
  ctx.font = '500 20px "IBM Plex Mono", ui-monospace, monospace';
  for (const tech of techs) {
    const tw = ctx.measureText(tech).width + 30;
    if (chipX + tw > W - 50) break;
    roundRectPath(ctx, chipX, chipY, tw, 40, 20);
    ctx.fillStyle = 'rgba(242, 87, 91, 0.13)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(242, 87, 91, 0.36)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#f6b9a8';
    ctx.fillText(tech, chipX + 15, chipY + 26);
    chipX += tw + 12;
  }

  return canvas;
}

export class ProjectWaveEngine {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private projects: Project[];
  private callbacks: WaveEngineCallbacks;
  private reducedMotion: boolean;
  private labels: WaveCardLabels;

  private THREE: any;
  private renderer: any;
  private scene: any;
  private camera: any;
  private envRenderTarget: any;
  private raycaster: any;
  private pointerNDC: any;

  private cardGeometry: any;
  private spineGeometry: any;
  private railMaterials: any[] = [];
  private backMaterial: any;
  private backTexture: any;
  private projectFrontMaterials: any[] = [];
  private projectTextures: any[] = [];

  private slots: Array<{
    outer: any;
    inner: any;
    cardMesh: any;
    assignedProjectIdx: number;
    logicalIndex: number;
  }> = [];

  private width = 1280;
  private height = 640;
  private position = 0;
  private target = 0;
  private selectedIndex = 0;

  private rafId = 0;
  private lastFrameTime = 0;
  private isPaused = false;
  private isInViewport = true;
  private isTabVisible = true;
  private isModalBlocking = false;
  private disposed = false;

  // Pointer & drag state
  private activePointerId: number | null = null;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private lastPointerX = 0;
  private lastDeltaX = 0;
  private isDraggingHorizontal = false;
  private pointerIntentLocked: 'none' | 'horizontal' | 'vertical' = 'none';
  private suppressNextClick = false;

  // Fine-pointer hover tilt
  private hoverTargetX = 0;
  private hoverTargetY = 0;
  private hoverSmoothX = 0;
  private hoverSmoothY = 0;

  private resizeObserver?: ResizeObserver;
  private visibilityObserver?: IntersectionObserver;

  private boundPointerDown: (e: PointerEvent) => void;
  private boundPointerMove: (e: PointerEvent) => void;
  private boundPointerUp: (e: PointerEvent) => void;
  private boundPointerCancel: (e: PointerEvent) => void;
  private boundLostCapture: (e: PointerEvent) => void;
  private boundPointerLeave: () => void;
  private boundClick: (e: MouseEvent) => void;
  private boundVisibilityChange: () => void;

  constructor(options: WaveEngineOptions) {
    this.container = options.container;
    this.canvas = options.canvas;
    this.projects = options.projects;
    this.callbacks = options.callbacks;
    this.reducedMotion = options.reducedMotion;
    this.labels = options.labels;
    this.selectedIndex = positiveModulo(options.initialIndex, Math.max(1, options.projects.length));
    this.position = this.selectedIndex * S;
    this.target = this.position;

    this.boundPointerDown = this.onPointerDown.bind(this);
    this.boundPointerMove = this.onPointerMove.bind(this);
    this.boundPointerUp = this.onPointerUp.bind(this);
    this.boundPointerCancel = this.onPointerCancel.bind(this);
    this.boundLostCapture = this.onLostPointerCapture.bind(this);
    this.boundPointerLeave = this.onPointerLeave.bind(this);
    this.boundClick = this.onClick.bind(this);
    this.boundVisibilityChange = this.onVisibilityChange.bind(this);
  }

  async init(): Promise<void> {
    if (this.disposed || this.projects.length === 0) return;

    try {
      const [THREE, rgbeMod] = await Promise.all([
        import('three'),
        import('three/examples/jsm/loaders/RGBELoader.js'),
      ]);
      if (this.disposed) return;

      this.THREE = THREE;
      const { RGBELoader } = rgbeMod;

      // Wait for fonts to be ready before painting textures
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 1500)),
        ]);
      }
      if (this.disposed) return;

      // Create transparent WebGLRenderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.08;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;

      this.scene = new THREE.Scene();

      const rect = this.container.getBoundingClientRect();
      this.width = Math.max(rect.width || 1280, 300);
      this.height = Math.max(rect.height || 580, 320);

      this.camera = new THREE.PerspectiveCamera(20, this.width / this.height, 0.1, 200);
      this.updateCameraFraming();

      this.raycaster = new THREE.Raycaster();
      this.pointerNDC = new THREE.Vector2();

      // Lighting alongside studio.hdr PMREM
      const hemi = new THREE.HemisphereLight(0xf6d5ce, 0x16090c, 0.9);
      this.scene.add(hemi);

      const dirKey = new THREE.DirectionalLight(0xfff1ec, 1.35);
      dirKey.position.set(6, 9, 12);
      this.scene.add(dirKey);

      const dirRim = new THREE.DirectionalLight(0xf2575b, 0.65);
      dirRim.position.set(-8, -3, 6);
      this.scene.add(dirRim);

      // Load local studio.hdr for physical reflections (PMREM)
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      pmrem.compileEquirectangularShader();
      try {
        const hdrTex = await new Promise<any>((resolve, reject) => {
          new RGBELoader().load('/assets/studio.hdr', resolve, undefined, reject);
        });
        if (!this.disposed) {
          this.envRenderTarget = pmrem.fromEquirectangular(hdrTex);
          this.scene.environment = this.envRenderTarget.texture;
          hdrTex.dispose();
        }
      } catch (hdrErr) {
        console.warn('studio.hdr could not load; continuing with analytical lights', hdrErr);
      } finally {
        pmrem.dispose();
      }
      if (this.disposed) return;

      // Build beveled ExtrudeGeometry card + normalized planar UVs + dedicated back face group
      this.cardGeometry = this.buildBeveledCardGeometry(THREE);
      this.spineGeometry = new THREE.BoxGeometry(0.06, 0.65, 0.08);

      // Rail materials (material group 1)
      this.railMaterials = RAIL_COLORS.map(
        (hex) =>
          new THREE.MeshStandardMaterial({
            color: hex,
            roughness: 0.35,
            metalness: 0.22,
          })
      );

      // Clean cosmic monogram backplate (material group 2) so cards rotating past 90deg never show mirrored text
      const backCanvas = this.paintBackPlateCanvas();
      this.backTexture = new THREE.CanvasTexture(backCanvas);
      this.backTexture.colorSpace = THREE.SRGBColorSpace;
      this.backMaterial = new THREE.MeshStandardMaterial({
        map: this.backTexture,
        roughness: 0.38,
        metalness: 0.14,
      });

      // Preload & decode real project cover images and paint crisp deck textures
      const decodedCovers = await Promise.all(
        this.projects.map((p) => loadHtmlImage(getProjectCover(p)))
      );
      if (this.disposed) return;

      const maxAniso = Math.min(this.renderer.capabilities.getMaxAnisotropy?.() || 4, 8);
      this.projectTextures = this.projects.map((project, idx) => {
        const texCanvas = paintProjectDeckCanvas(project, idx, this.projects.length, decodedCovers[idx], this.labels);
        const texture = new THREE.CanvasTexture(texCanvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = maxAniso;
        texture.needsUpdate = true;
        return texture;
      });

      this.projectFrontMaterials = this.projectTextures.map(
        (map) =>
          new THREE.MeshStandardMaterial({
            map,
            roughness: 0.42,
            metalness: 0.015,
          })
      );

      // Buffer 12 rigid board instances (each with outer group + inner group containing card + rear spine)
      for (let i = 0; i < BUFFER_COUNT; i++) {
        const outer = new THREE.Group();
        const inner = new THREE.Group();

        const initProjIdx = positiveModulo(i, this.projects.length);
        const railMat = this.railMaterials[initProjIdx % this.railMaterials.length];
        const cardMesh = new THREE.Mesh(this.cardGeometry, [
          this.projectFrontMaterials[initProjIdx],
          railMat,
          this.backMaterial,
        ]);
        cardMesh.userData = { slotIndex: i };
        inner.add(cardMesh);

        // Subtle physical rear mounting fin/spine attached inside the SAME inner group
        const spine = new THREE.Mesh(this.spineGeometry, railMat);
        spine.position.set(0, -0.78, -0.075);
        inner.add(spine);

        outer.add(inner);
        this.scene.add(outer);

        this.slots.push({
          outer,
          inner,
          cardMesh,
          assignedProjectIdx: initProjIdx,
          logicalIndex: i,
        });
      }

      this.bindEvents();
      this.applyWaveTransforms(0);
      this.renderer.render(this.scene, this.camera);
      this.callbacks.onReady();
      this.startLoop();
    } catch (err) {
      this.callbacks.onError(err instanceof Error ? err.message : 'WebGL initialization failed');
    }
  }

  private buildBeveledCardGeometry(THREE: any): any {
    const hw = CARD_W / 2;
    const hh = CARD_H / 2;
    const r = CARD_R;

    const shape = new THREE.Shape();
    shape.moveTo(-hw + r, -hh);
    shape.lineTo(hw - r, -hh);
    shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
    shape.lineTo(hw, hh - r);
    shape.quadraticCurveTo(hw, hh, hw - r, hh);
    shape.lineTo(-hw + r, hh);
    shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
    shape.lineTo(-hw, -hh + r);
    shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: 0.07,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.02,
      bevelSegments: 3,
      curveSegments: 32,
    });

    // Center along Z so rotation pivots cleanly through the board's middle plane
    geom.translate(0, 0, -0.035);

    // Explicit planar normalized UVs across the front/back face
    const pos = geom.attributes.position;
    const uv = geom.attributes.uv;
    geom.computeVertexNormals();
    const norm = geom.attributes.normal;

    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      const nz = norm.getZ(i);
      let u = clamp((px + hw) / CARD_W, 0, 1);
      if (nz < -0.5) {
        u = 1 - u; // Un-mirror back face UVs
      }
      const v = clamp((py + hh) / CARD_H, 0, 1);
      uv.setXY(i, u, v);
    }
    uv.needsUpdate = true;

    // Split material group 0 (caps) into group 0 (front cap) and group 2 (back cap)
    const oldGroups = [...geom.groups];
    geom.clearGroups();
    for (const g of oldGroups) {
      if (g.materialIndex === 0) {
        // ExtrudeGeometry emits front cap first, then back cap (half/half of cap vertices)
        let runStart = g.start;
        let runMat = norm.getZ(g.start) < 0 ? 2 : 0;
        const end = g.start + g.count;
        for (let vi = g.start + 3; vi < end; vi += 3) {
          const matIdx = norm.getZ(vi) < 0 ? 2 : 0;
          if (matIdx !== runMat) {
            geom.addGroup(runStart, vi - runStart, runMat);
            runStart = vi;
            runMat = matIdx;
          }
        }
        geom.addGroup(runStart, end - runStart, runMat);
      } else {
        geom.addGroup(g.start, g.count, g.materialIndex);
      }
    }

    return geom;
  }

  private paintBackPlateCanvas(): HTMLCanvasElement {
    const W = 540;
    const H = 750;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#1a0a0d');
    bg.addColorStop(0.5, '#0f0507');
    bg.addColorStop(1, '#230d12');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle central stringer
    ctx.fillStyle = 'rgba(242, 87, 91, 0.22)';
    ctx.fillRect(W / 2 - 1, 36, 2, H - 72);

    // Restrained geometric border
    roundRectPath(ctx, 26, 26, W - 52, H - 52, 26);
    ctx.strokeStyle = 'rgba(237, 228, 226, 0.14)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Minimalist monogram badge in center
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 54, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(242, 87, 91, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(242, 87, 91, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ede4e2';
    ctx.font = 'italic 600 44px "Fraunces", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('JR', W / 2, H / 2 + 2);

    ctx.font = '500 14px "IBM Plex Mono", ui-monospace, monospace';
    ctx.fillStyle = 'rgba(246, 185, 168, 0.65)';
    ctx.fillText('MADEBYJOHAN.XYZ', W / 2, H - 76);

    return canvas;
  }

  private bindEvents(): void {
    this.canvas.addEventListener('pointerdown', this.boundPointerDown);
    this.canvas.addEventListener('pointermove', this.boundPointerMove);
    this.canvas.addEventListener('pointerup', this.boundPointerUp);
    this.canvas.addEventListener('pointercancel', this.boundPointerCancel);
    this.canvas.addEventListener('lostpointercapture', this.boundLostCapture);
    this.canvas.addEventListener('pointerleave', this.boundPointerLeave);
    this.canvas.addEventListener('click', this.boundClick);
    document.addEventListener('visibilitychange', this.boundVisibilityChange);

    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || this.disposed) return;
      const w = Math.max(Math.round(entry.contentRect.width), 300);
      const h = Math.max(Math.round(entry.contentRect.height), 320);
      if (w !== this.width || h !== this.height) {
        this.width = w;
        this.height = h;
        this.updateCameraFraming();
        this.renderOnce();
      }
    });
    this.resizeObserver.observe(this.container);

    this.visibilityObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        this.isInViewport = Boolean(entry?.isIntersecting);
        if (this.shouldAnimate()) {
          this.startLoop();
        } else {
          this.stopLoop();
        }
      },
      { threshold: 0.02 }
    );
    this.visibilityObserver.observe(this.container);
  }

  private updateCameraFraming(): void {
    if (!this.camera || !this.renderer) return;
    const aspect = this.width / this.height;
    this.camera.aspect = aspect;
    this.camera.position.set(0, 0, aspect < 0.65 ? 17.5 : 13.8);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(this.width, this.height, false);
  }

  private onVisibilityChange(): void {
    this.isTabVisible = document.visibilityState === 'visible';
    if (this.shouldAnimate()) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (this.shouldAnimate()) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  setModalBlocking(blocking: boolean): void {
    this.isModalBlocking = blocking;
    if (this.shouldAnimate()) {
      this.startLoop();
    } else {
      this.stopLoop();
    }
  }

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    if (reduced) {
      this.hoverTargetX = 0;
      this.hoverTargetY = 0;
      this.hoverSmoothX = 0;
      this.hoverSmoothY = 0;
      this.target = Math.round(this.target / S) * S;
      this.position = this.target;
      this.applyWaveTransforms(0);
      this.renderOnce();
    }
  }

  step(deltaSteps: number): void {
    const snappedBase = Math.round(this.target / S) * S;
    this.target = snappedBase + deltaSteps * S;
    if (this.reducedMotion) {
      this.position = this.target;
      this.applyWaveTransforms(0);
      this.renderOnce();
      this.syncSelectedIndex();
    } else if (this.isPaused) {
      this.position = this.target;
      this.applyWaveTransforms(0);
      this.renderOnce();
      this.syncSelectedIndex();
    } else {
      this.startLoop();
    }
  }

  /** Choose the nearest equivalent logical index across the infinite wrap boundary. */
  goToProjectIndex(projectIdx: number, instant = false): void {
    const total = this.projects.length;
    if (total === 0) return;
    const normalizedTarget = positiveModulo(projectIdx, total);
    const currentLogical = Math.round(this.target / S);
    const currentMod = positiveModulo(currentLogical, total);

    let diff = normalizedTarget - currentMod;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    this.target = (currentLogical + diff) * S;
    if (instant || this.reducedMotion || this.isPaused) {
      this.position = this.target;
      this.applyWaveTransforms(0);
      this.renderOnce();
      this.syncSelectedIndex();
    } else {
      this.startLoop();
    }
  }

  reset(): void {
    this.target = 0;
    this.hoverTargetX = 0;
    this.hoverTargetY = 0;
    if (this.reducedMotion || this.isPaused) {
      this.position = 0;
      this.applyWaveTransforms(0);
      this.renderOnce();
      this.syncSelectedIndex();
    } else {
      this.startLoop();
    }
  }

  private onPointerDown(e: PointerEvent): void {
    // Ignore secondary mouse buttons and simultaneous second pointers
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (this.activePointerId !== null) return;

    this.activePointerId = e.pointerId;
    this.pointerStartX = e.clientX;
    this.pointerStartY = e.clientY;
    this.lastPointerX = e.clientX;
    this.lastDeltaX = 0;
    this.isDraggingHorizontal = false;
    this.pointerIntentLocked = 'none';
    this.suppressNextClick = false;
  }

  private onPointerMove(e: PointerEvent): void {
    // Fine-pointer tilt coordinates
    if (e.pointerType === 'mouse' && !this.reducedMotion) {
      const rect = this.canvas.getBoundingClientRect();
      this.hoverTargetX = e.clientX - (rect.left + rect.width / 2);
      this.hoverTargetY = e.clientY - (rect.top + rect.height / 2);
    }

    if (this.activePointerId !== e.pointerId) return;

    const totalDx = e.clientX - this.pointerStartX;
    const totalDy = e.clientY - this.pointerStartY;

    if (this.pointerIntentLocked === 'none') {
      const dist = Math.hypot(totalDx, totalDy);
      if (dist > 8) {
        if (Math.abs(totalDx) > Math.abs(totalDy)) {
          this.pointerIntentLocked = 'horizontal';
          this.isDraggingHorizontal = true;
          this.suppressNextClick = true;
          try {
            this.canvas.setPointerCapture(e.pointerId);
          } catch {
            // Pointer capture may fail if synthetic event
          }
          this.canvas.classList.add('is-dragging');
        } else {
          this.pointerIntentLocked = 'vertical';
          this.activePointerId = null;
          return;
        }
      } else {
        return;
      }
    }

    if (this.pointerIntentLocked === 'horizontal') {
      const dx = e.clientX - this.lastPointerX;
      this.lastPointerX = e.clientX;
      this.lastDeltaX = dx;
      this.target -= dx * DRAG_MULT;
      if (this.reducedMotion) {
        this.position = this.target;
        this.applyWaveTransforms(0);
        this.renderOnce();
        this.syncSelectedIndex();
      } else {
        this.startLoop();
      }
    }
  }

  private releasePointer(e: PointerEvent, applyThrow: boolean): void {
    if (this.activePointerId !== e.pointerId) return;
    const wasHorizontal = this.isDraggingHorizontal;

    this.activePointerId = null;
    this.isDraggingHorizontal = false;
    this.pointerIntentLocked = 'none';
    this.canvas.classList.remove('is-dragging');

    try {
      if (this.canvas.hasPointerCapture?.(e.pointerId)) {
        this.canvas.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Safe release
    }

    if (wasHorizontal) {
      if (applyThrow && !this.reducedMotion) {
        this.target -= this.lastDeltaX * DRAG_MULT * THROW_MULT;
      }
      if (this.isScrollDriven) {
        const maxLogical = Math.max(0, this.projects.length - 1);
        const clampedLogical = clamp(Math.round(this.target / S), 0, maxLogical);
        this.target = clampedLogical * S;
        this.callbacks.onManualTargetIndex?.(clampedLogical);
      } else {
        this.target = Math.round(this.target / S) * S;
      }
      if (this.reducedMotion || this.isPaused) {
        this.position = this.target;
        this.applyWaveTransforms(0);
        this.renderOnce();
        this.syncSelectedIndex();
      } else {
        this.startLoop();
      }
    }
  }

  private onPointerUp(e: PointerEvent): void {
    this.releasePointer(e, true);
  }

  private onPointerCancel(e: PointerEvent): void {
    this.releasePointer(e, false);
  }

  private onLostPointerCapture(e: PointerEvent): void {
    this.releasePointer(e, false);
  }

  private onPointerLeave(): void {
    this.hoverTargetX = 0;
    this.hoverTargetY = 0;
  }

  private onClick(e: MouseEvent): void {
    if (this.suppressNextClick) {
      this.suppressNextClick = false;
      return;
    }
    if (!this.raycaster || !this.camera || !this.pointerNDC) return;

    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    this.pointerNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointerNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointerNDC, this.camera);
    const meshes = this.slots.map((s) => s.cardMesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    if (hits.length === 0) return;

    const slotIndex = hits[0].object?.userData?.slotIndex;
    if (typeof slotIndex !== 'number') return;
    const slot = this.slots[slotIndex];
    if (!slot) return;

    const centerLogical = Math.round(this.position / S);
    // Clicking the center board does NOT navigate away; only neighboring boards rotate to center
    if (slot.logicalIndex === centerLogical) {
      return;
    }

    if (this.isScrollDriven) {
      const targetProj = positiveModulo(slot.logicalIndex, this.projects.length);
      this.target = targetProj * S;
      this.callbacks.onManualTargetIndex?.(targetProj);
    } else {
      this.target = slot.logicalIndex * S;
    }
    if (this.reducedMotion || this.isPaused) {
      this.position = this.target;
      this.applyWaveTransforms(0);
      this.renderOnce();
      this.syncSelectedIndex();
    } else {
      this.startLoop();
    }
  }

  private shouldAnimate(): boolean {
    return (
      !this.disposed &&
      !this.isPaused &&
      this.isInViewport &&
      this.isTabVisible &&
      !this.isModalBlocking
    );
  }

  private startLoop(): void {
    if (this.rafId || !this.shouldAnimate()) return;
    this.lastFrameTime = performance.now();
    const tick = (now: number) => {
      if (!this.shouldAnimate()) {
        this.rafId = 0;
        return;
      }
      const rawDelta = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      const dt = Math.min(Math.max(rawDelta, 0), 0.05);

      this.stepPhysics(dt);
      this.applyWaveTransforms(dt);
      this.renderer.render(this.scene, this.camera);
      this.syncSelectedIndex();

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private stopLoop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private isScrollDriven = false;
  private lastReportedMoving = false;

  setScrollDriven(enabled: boolean): void {
    this.isScrollDriven = enabled;
  }

  /**
   * Drive the wave target continuously from vertical scroll progress [0, 1]
   * across all real projects [0 .. projects.length - 1].
   */
  setScrollProgress(progress: number): void {
    const count = this.projects.length;
    if (count <= 1 || this.isDraggingHorizontal) return;
    const clamped = clamp(progress, 0, 1);
    this.target = clamped * (count - 1) * S;
    if (this.reducedMotion || this.isPaused) {
      this.position = this.target;
      this.applyWaveTransforms(0);
      this.renderOnce();
      this.syncSelectedIndex();
    } else {
      this.startLoop();
    }
  }

  private stepPhysics(dt: number): void {
    if (!this.isDraggingHorizontal && !this.isScrollDriven) {
      this.target = Math.round(this.target / S) * S;
    }
    if (this.reducedMotion) {
      this.position = this.target;
    } else {
      const alpha = Math.min(1, dt * 10);
      this.position = lerp(this.position, this.target, alpha);
      if (!this.isDraggingHorizontal && Math.abs(this.target - this.position) < 0.0005) {
        this.position = this.target;
      }
    }

    const movingNow = this.isDraggingHorizontal || Math.abs(this.target - this.position) > 0.08;
    if (movingNow !== this.lastReportedMoving) {
      this.lastReportedMoving = movingNow;
      this.callbacks.onMotionStateChange?.(movingNow);
    }
  }

  private applyWaveTransforms(dt: number): void {
    const R = clamp(1440 / Math.max(this.width, 320), 1, 2.4);
    const W = 0.25 * R;
    const totalProjects = this.projects.length;

    if (!this.reducedMotion && dt > 0) {
      const smoothAlpha = Math.min(1, dt * 10);
      this.hoverSmoothX = lerp(this.hoverSmoothX, this.hoverTargetX, smoothAlpha);
      this.hoverSmoothY = lerp(this.hoverSmoothY, this.hoverTargetY, smoothAlpha);
    } else if (this.reducedMotion) {
      this.hoverSmoothX = 0;
      this.hoverSmoothY = 0;
    }

    const tiltScale = 0.2 / 1280;

    for (let i = 0; i < this.slots.length; i++) {
      const slot = this.slots[i];
      const x = wrap(i * S - this.position, -HALF_SPAN, HALF_SPAN);
      const logicalIndex = Math.round((this.position + x) / S);
      slot.logicalIndex = logicalIndex;

      // Dynamically assign the exact real project for this wrapped slot
      const projIdx = positiveModulo(logicalIndex, totalProjects);
      if (projIdx !== slot.assignedProjectIdx) {
        slot.assignedProjectIdx = projIdx;
        const railMat = this.railMaterials[projIdx % this.railMaterials.length];
        slot.cardMesh.material = [
          this.projectFrontMaterials[projIdx],
          railMat,
          this.backMaterial,
        ];
      }

      const centerWeight = clamp(1 - Math.abs(x) / S, 0, 1);
      const tiltY = this.reducedMotion ? 0 : this.hoverSmoothX * tiltScale * centerWeight;
      const tiltX = this.reducedMotion ? 0 : this.hoverSmoothY * tiltScale * centerWeight;

      const rotX = -18 * DEG2RAD + tiltX;
      const rotY = x * 0.45 - 18 * DEG2RAD + tiltY;
      const rotZ = 11.25 * DEG2RAD;

      // Diagonal wave path: incoming cards descend from top-right (+x, +y)
      // through center (0, 0) and exit toward bottom-left (-x, -y) with sinusoidal ripple & receding Z.
      const diagX = x * 0.92;
      const diagY = x * 0.34 + Math.sin(x * W) * 0.45;
      slot.outer.position.set(diagX, diagY, -Math.abs(x) * 0.9 - 0.15);
      slot.outer.rotation.set(rotX, rotY, rotZ);
      slot.outer.scale.setScalar(1.36);

      // Rotate the ENTIRE inner group (card + rear spine) together so parts never detach
      slot.inner.rotation.z = rotY * 0.6;
    }
  }

  private syncSelectedIndex(): void {
    const idx = positiveModulo(Math.round(this.position / S), this.projects.length);
    if (idx !== this.selectedIndex) {
      this.selectedIndex = idx;
      this.callbacks.onSelectIndex(idx);
    }
  }

  private renderOnce(): void {
    if (!this.disposed && this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  dispose(): void {
    this.disposed = true;
    this.stopLoop();

    this.resizeObserver?.disconnect();
    this.visibilityObserver?.disconnect();

    this.canvas.removeEventListener('pointerdown', this.boundPointerDown);
    this.canvas.removeEventListener('pointermove', this.boundPointerMove);
    this.canvas.removeEventListener('pointerup', this.boundPointerUp);
    this.canvas.removeEventListener('pointercancel', this.boundPointerCancel);
    this.canvas.removeEventListener('lostpointercapture', this.boundLostCapture);
    this.canvas.removeEventListener('pointerleave', this.boundPointerLeave);
    this.canvas.removeEventListener('click', this.boundClick);
    document.removeEventListener('visibilitychange', this.boundVisibilityChange);

    this.cardGeometry?.dispose?.();
    this.spineGeometry?.dispose?.();
    this.railMaterials.forEach((m) => m?.dispose?.());
    this.backMaterial?.dispose?.();
    this.backTexture?.dispose?.();
    this.projectFrontMaterials.forEach((m) => m?.dispose?.());
    this.projectTextures.forEach((t) => t?.dispose?.());
    this.envRenderTarget?.dispose?.();
    this.renderer?.dispose?.();

    this.slots = [];
    this.railMaterials = [];
    this.projectFrontMaterials = [];
    this.projectTextures = [];
  }
}
