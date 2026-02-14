"use client"

import { Canvas, useThree } from "@react-three/fiber"
import { XR, createXRStore } from "@react-three/xr"
import { useGLTF } from "@react-three/drei"
import { useRef, useState } from "react"
import * as THREE from "three"

const store = createXRStore()

/* -------- START AR -------- */

const startAR = async () => {
  if(!navigator.xr) return
  await store.enterAR()
}

/* -------- MODEL -------- */

function FloatingModel(){

  const ref = useRef<any>(null)
  const { scene } = useGLTF("/models/model.glb")
  const { camera } = useThree()

  const [placed,setPlaced] = useState(false)

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

  return(
    <primitive
      ref={ref}
      object={scene}
      scale={0.3}
      visible={placed}
      onPointerDown={placeObject}
      onClick={()=>ref.current.rotation.y += 0.5}
    />
  )
}

/* -------- MAIN -------- */

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
          <FloatingModel/>
        </XR>
      </Canvas>
    </>
  )
}