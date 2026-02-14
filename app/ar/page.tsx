"use client"

import dynamic from "next/dynamic"

const ARScene = dynamic(()=>import("./ARScene"),{
  ssr:false
})

export default function ARPage(){
  return <ARScene/>
}