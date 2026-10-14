
const Banner = ({title,bgImage}) => {
  return (
    <div className='relative mt-32 flex h-[50vh] items-center justify-center bg-cover bg-center lg:mt-25' 
    style={{backgroundImage: `url(${bgImage})`}}>
      <h2 className='text-5xl text-zinc-800 bg-white p-5 rounded-xl font-bold z-10'>{title}</h2>
      <div className='bg-black/50 absolute inset-0'></div>
    </div>
  )
}

export default Banner
