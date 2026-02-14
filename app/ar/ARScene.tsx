"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { XR, ARButton, createXRStore, useXR } from "@react-three/xr"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

const store = createXRStore()

/* ---------------- MODEL ---------------- */

function InteractiveModel({ position }: any) {

  const ref = useRef<any>(null)
  const { scene } = useGLTF("/models/model.glb")

  const [scale, setScale] = useState(0.3)
  const [rotation, setRotation] = useState(0)

  let lastX = 0
  let lastDist = 0

  const onTouchMove = (e:any)=>{

    if(!ref.current) return

    if(e.touches.length===1){

      const dx = e.touches[0].clientX - lastX
      ref.current.position.x += dx*0.001
      lastX = e.touches[0].clientX
    }

    if(e.touches.length===2){

      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY

      const dist = Math.sqrt(dx*dx + dy*dy)

      if(lastDist){
        const diff = dist-lastDist
        setScale(prev=>prev+diff*0.0005)
      }

      lastDist = dist
    }
  }

  return (
    <primitive
      ref={ref}
      object={scene}
      position={position}
      scale={scale}
      rotation={[0,rotation,0]}
      onClick={()=>setRotation(prev=>prev+0.5)}
      onTouchMove={onTouchMove}
    />
  )
}

/* ---------------- RETICLE ---------------- */

function Reticle({ setPos }: any) {

  const { session } = useXR()

  const ref = useRef<any>(null)
  const hitTestSource = useRef<any>(null)

  useEffect(() => {

    if (!session) return

    const xrSession = session as XRSession

    xrSession.requestReferenceSpace("viewer").then((space) => {

      xrSession.requestHitTestSource({ space }).then((source) => {
        hitTestSource.current = source
      })

    })

  }, [session])

  useFrame((state, delta, frame) => {

    if (!frame) return
    if (!hitTestSource.current) return

    const refSpace = store.getState().referenceSpace
    const hits = frame.getHitTestResults(hitTestSource.current)

    if (hits.length > 0) {

      const pose = hits[0].getPose(refSpace)

      if (pose && ref.current) {

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

  return (
    <mesh ref={ref} visible={false}>
      <ringGeometry args={[0.1,0.15,32]}/>
      <meshBasicMaterial color="white"/>
    </mesh>
  )
}

/* ---------------- MAIN SCENE ---------------- */

export default function ARScene(){

  const [pos,setPos] = useState<any>(null)
  const [placed,setPlaced] = useState(false)

  return(
    <>

    <ARButton
      store={store}
      sessionInit={{
        requiredFeatures:["hit-test","local-floor"]
      }}
    />

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