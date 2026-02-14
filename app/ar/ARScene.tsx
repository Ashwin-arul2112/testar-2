"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { XR, createXRStore } from "@react-three/xr"
import { useGLTF } from "@react-three/drei"
import { useRef, useState } from "react"
import * as THREE from "three"

const store = createXRStore()

/* ---------- START AR ---------- */

const startAR = async () => {
  if(!navigator.xr) return
  await store.enterAR()
}

/* ---------- MODEL ---------- */

function InteractiveModel(){

  const ref = useRef<any>(null)
  const { scene } = useGLTF("/models/model.glb")
  const { camera } = useThree()

  const [placed,setPlaced] = useState(false)
  const [scale,setScale] = useState(0.3)

  let lastX = 0
  let lastDist = 0

  /* PLACE IN AIR */
  const placeObject = () => {

    if(!ref.current) return

    const dir = new THREE.Vector3(0,0,-1)
      .applyQuaternion(camera.quaternion)

    const pos = new THREE.Vector3()
      .copy(camera.position)
      .add(dir.multiplyScalar(1.5))

    ref.current.position.copy(pos)
    setPlaced(true)
  }

  /* TOUCH MOVE */
  const onTouchMove = (e:any)=>{

    if(!placed) return
    if(!ref.current) return

    /* MOVE */
    if(e.touches.length===1){

      const dx = e.touches[0].clientX - lastX
      ref.current.position.x += dx*0.002
      lastX = e.touches[0].clientX
    }

    /* PINCH SCALE */
    if(e.touches.length===2){

      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx*dx + dy*dy)

      if(lastDist){

        const diff = dist-lastDist
        setScale(prev=>Math.max(0.1,prev+diff*0.0005))
      }

      lastDist = dist
    }
  }

  /* TWO FINGER ROTATE */
  const onWheel = ()=>{
    if(ref.current) ref.current.rotation.y += 0.2
  }

  return(
    <primitive
      ref={ref}
      object={scene}
      scale={scale}
      visible={placed}
      onPointerDown={placeObject}
      onTouchMove={onTouchMove}
      onDoubleClick={onWheel}
    />
  )
}

/* ---------- MAIN ---------- */

export default function ARScene(){

  return(
    <>
      <button
        onClick={startAR}
        style={{
          position:"absolute",
          top:20,
          left:20,
          zIndex:10,
          padding:12,
          background:"black",
          color:"white"
        }}
      >
        START AR
      </button>

      <Canvas>
        <XR store={store}>
          <ambientLight intensity={1}/>
          <InteractiveModel/>
        </XR>
      </Canvas>
    </>
  )
}