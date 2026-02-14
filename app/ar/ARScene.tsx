"use client"

import { Canvas } from "@react-three/fiber"
import { XR, createXRStore, ARButton } from "@react-three/xr"
import { useGLTF } from "@react-three/drei"
import { useState } from "react"

const store = createXRStore()

function Model({ position }: any) {
  const { scene } = useGLTF("/models/model.glb")
  return <primitive object={scene} position={position} scale={0.3}/>
}

function Placement() {

  const [pos, setPos] = useState<any>(null)

  return (
    <mesh
      onClick={(e:any)=>{
        setPos(e.point)
      }}
    >
      {pos && <Model position={pos}/>}
    </mesh>
  )
}

export default function ARScene() {

  return (
    <>
      <ARButton store={store} />

      <Canvas>
        <XR store={store}>
          <ambientLight />
          <Placement />
        </XR>
      </Canvas>
    </>
  )
}