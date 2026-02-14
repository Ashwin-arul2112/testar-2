"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { XR, createXRStore, useXR } from "@react-three/xr"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

const store = createXRStore()

/* ---------------- MODEL ---------------- */

function InteractiveModel({ position }: any) {

  const ref = useRef<any>(null)
  const { scene } = useGLTF("/models/model.glb")

  const [scale,setScale] = useState(0.3)
  const [rotation,setRotation] = useState(0)

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={scale}
      rotation={[0,rotation,0]}
      onClick={()=>setRotation(prev=>prev+0.5)}
    />
  )
}

/* ---------------- RETICLE ---------------- */

function Reticle({ setPos }: any) {

  const { session } = useXR()

  const ref = useRef<any>(null)
  const hitTestSource = useRef<any>(null)
  const viewerSpace = useRef<any>(null)

  useEffect(()=>{

    if(!session) return

    const xrSession = session as XRSession

    xrSession.requestReferenceSpace("viewer").then((space)=>{

      viewerSpace.current = space

      ;(xrSession as any).requestHitTestSource({space}).then((source:any)=>{
        hitTestSource.current = source
      })

    })

  },[session])

  useFrame((state,delta,frame)=>{

    if(!frame) return
    if(!hitTestSource.current) return

    const refSpace = store.getState().originReferenceSpace
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

        setPos(ref.current.position.clone())
      }
    }
  })

  return(
    <mesh ref={ref} visible={false}>
      <ringGeometry args={[0.1,0.15,32]}/>
      <meshBasicMaterial color="white"/>
    </mesh>
  )
}

/* ---------------- MAIN ---------------- */

export default function ARScene(){

  const [pos,setPos] = useState<any>(null)
  const [placed,setPlaced] = useState(false)

  const startAR = async()=>{

    if(!navigator.xr) return

    const session = await navigator.xr.requestSession("immersive-ar",{
      requiredFeatures:["hit-test","local-floor"]
    })

    await store.enterAR()   // ✅ NO ARGUMENT HERE
  }

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

          {!placed && <Reticle setPos={setPos}/>}

          {pos && !placed && (
            <mesh onClick={()=>setPlaced(true)}>
              <ringGeometry args={[0.1,0.15,32]}/>
              <meshBasicMaterial color="green"/>
            </mesh>
          )}

          {placed && <InteractiveModel position={pos}/>}

        </XR>
      </Canvas>

    </>
  )
}