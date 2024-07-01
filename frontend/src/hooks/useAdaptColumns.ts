export default function adaptColumns(width: number) {
  let str = "";
  if (width == 1024) {
    str = "9";
  } else if (width < 1280) str = "6";
  else str = "9";
  return str;
}
