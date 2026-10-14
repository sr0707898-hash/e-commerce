
const Banner = ({title,bgImage}) => {
  return (
    <div className='relative mt-32 flex h-[50vh] items-center justify-center bg-cover bg-center lg:mt-25' 
    style={{backgroundImage: `url(${bgImage})`}}>
      <h1 className='z-10 rounded-xl bg-white p-4 text-3xl font-bold text-zinc-800 sm:p-5 sm:text-5xl'>{title}</h1>
      <div className='bg-black/50 absolute inset-0'></div>
    </div>
  )
}

export default Banner
