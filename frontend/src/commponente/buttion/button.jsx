
const Button = (props) => {
  return (
    <button type={props.type || "button"} onClick={props.onClick} className='bg-red-500 text-white px-8 py-3 rounded-lg hover:scale-105 hover:bg-red-600 cursor-pointer'>{props.content}</button>
  )
}

export default Button
