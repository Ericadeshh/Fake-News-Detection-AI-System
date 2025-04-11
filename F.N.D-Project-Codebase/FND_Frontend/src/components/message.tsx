function Message() {
  let name = "Eric";
  if (name === "Eric") {
    return <h1>Hello {name}</h1>;
  } else {
    return <h1>Hello Stranger</h1>;
  }
}

export default Message;
