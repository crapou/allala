import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import '../styles/background.css'

export default function Background() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // === SETUP ===
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    camera.position.z = 300

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x05070b, 1)
    container.appendChild(renderer.domElement)

    // === PARTICLES ===
    const PARTICLE_COUNT = 2000
    const SPHERE_RADIUS = 150
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const colors = new Float32Array(PARTICLE_COUNT * 3)
    const sizes = new Float32Array(PARTICLE_COUNT)
    const phases = new Float32Array(PARTICLE_COUNT)
    const speeds = new Float32Array(PARTICLE_COUNT)
    const originalPositions = new Float32Array(PARTICLE_COUNT * 3)

    // Color palette: electric blue, violet, cyan, white
    const palette = [
      new THREE.Color(0x2f7bf6), // blue
      new THREE.Color(0x6c5ce7), // violet
      new THREE.Color(0x00cec9), // cyan
      new THREE.Color(0xa29bfe), // lavender
      new THREE.Color(0x0984e3), // deep blue
      new THREE.Color(0xe056fd), // pink-violet
      new THREE.Color(0x74b9ff), // light blue
    ]

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Distribute on sphere surface with some randomness
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = SPHERE_RADIUS * (0.8 + Math.random() * 0.4)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      originalPositions[i * 3] = x
      originalPositions[i * 3 + 1] = y
      originalPositions[i * 3 + 2] = z

      const color = palette[Math.floor(Math.random() * palette.length)]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      sizes[i] = 1.5 + Math.random() * 3
      phases[i] = Math.random() * Math.PI * 2
      speeds[i] = 0.3 + Math.random() * 0.7
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    // Custom shader for glow particles
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        uniform float uPixelRatio;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          float dist = length(mvPosition.xyz);
          vAlpha = smoothstep(400.0, 100.0, dist);
          gl_PointSize = size * uPixelRatio * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float glow = 1.0 - smoothstep(0.0, 0.5, d);
          glow = pow(glow, 1.5);
          gl_FragColor = vec4(vColor, glow * vAlpha * 0.9);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // === CONNECTIONS (lines between close particles) ===
    const MAX_CONNECTIONS = 600
    const linePositions = new Float32Array(MAX_CONNECTIONS * 6)
    const lineColors = new Float32Array(MAX_CONNECTIONS * 6)
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3))
    lineGeometry.setDrawRange(0, 0)

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    scene.add(lines)

    // === MOUSE ===
    const mouse = new THREE.Vector2(0, 0)
    const handleMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
    }

    // === ANIMATE ===
    let time = 0
    const CONNECTION_DIST = 35

    const animate = () => {
      time += 0.008

      // Oscillate particles
      const pos = geometry.attributes.position.array
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3
        const phase = phases[i]
        const speed = speeds[i]
        const ox = originalPositions[i3]
        const oy = originalPositions[i3 + 1]
        const oz = originalPositions[i3 + 2]

        // Oscillation: push particles in and out from center
        const dist = Math.sqrt(ox * ox + oy * oy + oz * oz)
        const nx = ox / dist
        const ny = oy / dist
        const nz = oz / dist

        const oscillation = Math.sin(time * speed * 2 + phase) * 20
        const wave = Math.sin(time * 0.5 + dist * 0.02) * 10

        pos[i3] = ox + nx * (oscillation + wave)
        pos[i3 + 1] = oy + ny * (oscillation + wave)
        pos[i3 + 2] = oz + nz * (oscillation + wave)
      }
      geometry.attributes.position.needsUpdate = true

      // Update connections
      let lineIndex = 0
      const lPos = lineGeometry.attributes.position.array
      const lCol = lineGeometry.attributes.color.array

      for (let i = 0; i < PARTICLE_COUNT && lineIndex < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT && lineIndex < MAX_CONNECTIONS; j++) {
          const dx = pos[i * 3] - pos[j * 3]
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1]
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2]
          const d = dx * dx + dy * dy + dz * dz

          if (d < CONNECTION_DIST * CONNECTION_DIST) {
            const idx = lineIndex * 6
            lPos[idx] = pos[i * 3]
            lPos[idx + 1] = pos[i * 3 + 1]
            lPos[idx + 2] = pos[i * 3 + 2]
            lPos[idx + 3] = pos[j * 3]
            lPos[idx + 4] = pos[j * 3 + 1]
            lPos[idx + 5] = pos[j * 3 + 2]

            const alpha = 1 - Math.sqrt(d) / CONNECTION_DIST
            lCol[idx] = colors[i * 3] * alpha
            lCol[idx + 1] = colors[i * 3 + 1] * alpha
            lCol[idx + 2] = colors[i * 3 + 2] * alpha
            lCol[idx + 3] = colors[j * 3] * alpha
            lCol[idx + 4] = colors[j * 3 + 1] * alpha
            lCol[idx + 5] = colors[j * 3 + 2] * alpha

            lineIndex++
          }
        }
      }
      lineGeometry.attributes.position.needsUpdate = true
      lineGeometry.attributes.color.needsUpdate = true
      lineGeometry.setDrawRange(0, lineIndex * 2)

      // Rotate the whole scene slowly + mouse influence
      points.rotation.y = time * 0.15 + mouse.x * 0.3
      points.rotation.x = Math.sin(time * 0.1) * 0.2 + mouse.y * 0.2
      lines.rotation.y = points.rotation.y
      lines.rotation.x = points.rotation.x

      material.uniforms.uTime.value = time

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    // === RESIZE ===
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      container.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      lineGeometry.dispose()
      lineMaterial.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div className="bg" ref={containerRef} />
  )
}