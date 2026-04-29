import haileyBieberImg from "@/assets/hailey-bieber.png";
import zendayaImg from "@/assets/zendaya.avif";
import hyunBinImg from "@/assets/hyun-bin.jpg";
import timotheeImg from "@/assets/timothee-chalamet.webp";
import skeptaImg from "@/assets/skepta.webp";
import pharrellImg from "@/assets/pharrell.webp";
import kimKImg from "@/assets/kim-kardashian.png";
import traceeImg from "@/assets/tracee-ellis-ross.png";
import lewisImg from "@/assets/lewis-hamilton.webp";
import juliaImg from "@/assets/julia-sarr-jamois.jpg";
import rihannaImg from "@/assets/rihanna.jpg";
import maysaImg1 from "@/assets/maysa-shems-1.png";
import hannahImg from "@/assets/hannah-harrell.png";
import lawrenceImg from "@/assets/lawrence-schlossman.png";
import maryannImg from "@/assets/maryann-santos.png";
import skylarImg from "@/assets/skylar-marshai.png";
import teairaImg from "@/assets/teaira-walker.jpg";

export interface StyleIcon {
  id: string;
  name: string;
  from: string;
  img: string;
  category: string;
  instagram?: string;
  ltk?: string;
}

export const styleIcons: StyleIcon[] = [
  { id: "skepta", name: "Skepta", from: "Tottenham, England", img: skeptaImg, category: "Streetwear & Casual", instagram: "https://instagram.com/skepta" },
  { id: "julia", name: "Julia Sarr-Jamois", from: "London, England", img: juliaImg, category: "Streetwear & Casual", instagram: "https://instagram.com/juliasarrjamois" },
  { id: "asap", name: "A$AP Rocky", from: "Harlem, USA", img: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/A%24AP_Rocky_at_the_2025_Cannes_Film_Festival_%28cropped_3x4%29.jpg/400px-A%24AP_Rocky_at_the_2025_Cannes_Film_Festival_%28cropped_3x4%29.jpg", category: "Streetwear & Casual", instagram: "https://instagram.com/asaprocky" },
  { id: "zendaya", name: "Zendaya", from: "Los Angeles, USA", img: zendayaImg, category: "Red Carpet & Editorial", instagram: "https://instagram.com/zendaya" },
  { id: "timothee", name: "Timothée Chalamet", from: "New York, USA", img: timotheeImg, category: "Streetwear & Casual", instagram: "https://instagram.com/tchalamet" },
  { id: "hailey", name: "Hailey Bieber", from: "Tucson, USA", img: haileyBieberImg, category: "Classic & Tailored", instagram: "https://instagram.com/haileybieber" },
  { id: "hyunbin", name: "Hyun Bin", from: "Seoul, South Korea", img: hyunBinImg, category: "Classic & Tailored", instagram: "https://instagram.com/vast_com" },
  { id: "rihanna", name: "Rihanna", from: "Barbados", img: rihannaImg, category: "Red Carpet & Editorial", instagram: "https://instagram.com/badgalriri" },
  { id: "lawrence", name: "Lawrence Schlossman", from: "New York, USA", img: lawrenceImg, category: "Streetwear & Casual", instagram: "https://instagram.com/lawrenceschlossman" },
  { id: "kim", name: "Kim Kardashian", from: "Los Angeles, USA", img: kimKImg, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/kimkardashian" },
  { id: "pharrell", name: "Pharrell", from: "Virginia Beach, USA", img: pharrellImg, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/pharrell" },
  { id: "tracee", name: "Tracee Ellis Ross", from: "Los Angeles, USA", img: traceeImg, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/traceeellisross" },
  { id: "lewis", name: "Lewis Hamilton", from: "Stevenage, England", img: lewisImg, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/lewishamilton" },
  { id: "maysa1", name: "Maysa Shems", from: "Nigeria / USA", img: maysaImg1, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/maysashems" },
  { id: "maryann", name: "Maryann Santos", from: "USA", img: maryannImg, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/styleby.ms" },
  { id: "hannah", name: "Hannah Harrell", from: "USA", img: hannahImg, category: "Classic & Tailored", instagram: "https://instagram.com/hannahharrell_", ltk: "https://www.shopltk.com/explore/hannahharrell_" },
  { id: "skylar", name: "Skylar Marshai", from: "USA", img: skylarImg, category: "Streetwear & Casual", instagram: "https://www.instagram.com/skylarmarshai/" },
  { id: "teaira", name: "Teaira Walker", from: "USA", img: teairaImg, category: "Streetwear & Casual", instagram: "https://www.instagram.com/teairawalker/" },
];

export const categories = ["Streetwear & Casual", "Red Carpet & Editorial", "Classic & Tailored", "Avant-Garde & Eclectic"];
