"use client"

export default function Home() {
  return (
    <div className="h-screen flex justify-center items-center">
      <button
        onClick={()=>window.location.href="/ar"}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        Start AR
      </button>
    </div>
  )
}