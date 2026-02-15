"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { XR, createXRStore, useXR } from "@react-three/xr"
import { useGLTF } from "@react-three/drei"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

const store = createXRStore({
  requiredFeatures:["hit-test","local-floor"]
} as any)

/* ---------- START AR ---------- */

const startAR = async () => {
  if(!navigator.xr) return
  await store.enterAR()
}

/* ---------- WORLD LOCKED MODEL ---------- */

function WorldLockedModel(){

  const ref = useRef<any>(null)
  const { scene } = useGLTF("/models/wand.glb")
  const { session } = useXR()

  const [placed,setPlaced] = useState(false)
  const hitTestSource = useRef<any>(null)

  /* CREATE INVISIBLE RAY SOURCE */
  useEffect(()=>{

    if(!session) return

    const xrSession = session as XRSession

    xrSession.requestReferenceSpace("viewer").then((viewerSpace)=>{

      const hitTest = (xrSession as any).requestHitTestSource
      if(!hitTest) return

      hitTest.call(xrSession,{
        space:viewerSpace
      }).then((source:any)=>{
        hitTestSource.current = source
      })

    })

  },[session])

  /* TAP ANYWHERE TO PLACE */

  const placeObject = (frame:any)=>{

    if(!frame) return
    if(!hitTestSource.current) return

    const refSpace = store.getState().originReferenceSpace as XRReferenceSpace
    if(!refSpace) return

    const hits = frame.getHitTestResults(hitTestSource.current)

    if(hits.length>0){

      const pose = hits[0].getPose(refSpace)

      if(pose && ref.current){

        ref.current.position.set(
          pose.transform.position.x,
          pose.transform.position.y,
          pose.transform.position.z
        )

        setPlaced(true)
      }
    }
  }

  /* FRAME LOOP */
  useFrame((_,__,frame)=>{

    if(!placed){
      placeObject(frame)
    }

  })

  return(
    <primitive
      ref={ref}
      object={scene}
      scale={0.3}
      visible={placed}
      onClick={()=>ref.current.rotation.y += 0.5}
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
          <WorldLockedModel/>
        </XR>
      </Canvas>
    </>
  )
}