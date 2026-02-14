"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { XR, createXRStore, useXR } from "@react-three/xr"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

/* ---------- XR STORE ---------- */

const store = createXRStore({
  requiredFeatures: ["hit-test", "local-floor"]
} as any)

/* ---------- START AR ---------- */

const startAR = async () => {
  if (!navigator.xr) return
  await store.enterAR()
}

/* ---------- MODEL ---------- */

function InteractiveModel({ position }: any) {

  const ref = useRef<any>(null)
  const { scene } = useGLTF("/models/model.glb")

  const [rotation,setRotation] = useState(0)

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={0.3}
      rotation={[0,rotation,0]}
      onClick={()=>setRotation(prev=>prev+0.5)}
    />
  )
}

/* ---------- RETICLE ---------- */

function Reticle({ placeModel }: any) {

  const { session } = useXR()

  const ref = useRef<any>(null)
  const hitTestSource = useRef<any>(null)

  useEffect(()=>{

    if(!session) return

    const xrSession = session as XRSession

    xrSession.requestReferenceSpace("viewer").then((space)=>{

      const hitTest = (xrSession as any).requestHitTestSource
      if(!hitTest) return

      hitTest.call(xrSession,{space}).then((source:any)=>{
        hitTestSource.current = source
      })

    })

  },[session])

  useFrame((_,__,frame)=>{

    if(!frame) return
    if(!hitTestSource.current) return

    const refSpace = store.getState().originReferenceSpace as XRReferenceSpace
    if(!refSpace) return

    const hits = frame.getHitTestResults(hitTestSource.current)

    if(hits.length>0){

      const pose = hits[0].getPose(refSpace)

      if(pose && ref.current){

        ref.current.visible = true

        ref.current.position.set(
          pose.transform.position.x,
          pose.transform.position.y,
          pose.transform.position.z
        )
      }
    }
  })

  return(
    <mesh
      ref={ref}
      visible={false}
      onClick={()=>{
        if(ref.current){
          placeModel(ref.current.position.clone())
        }
      }}
    >
      <ringGeometry args={[0.1,0.15,32]}/>
      <meshBasicMaterial color="white"/>
    </mesh>
  )
}

/* ---------- MAIN ---------- */

export default function ARScene(){

  const [pos,setPos] = useState<any>(null)

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

          {!pos && <Reticle placeModel={setPos}/>}

          {pos && <InteractiveModel position={pos}/>}

        </XR>
      </Canvas>
    </>
  )
}