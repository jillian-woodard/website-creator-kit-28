import jourdanRianeImg from "@/assets/jourdan-riane.jpg";
import juliaImg from "@/assets/julia-sarr-jamois.jpg";
import maysaImg1 from "@/assets/maysa-shems-1.png";
import hannahImg from "@/assets/hannah-harrell.png";
import lawrenceImg from "@/assets/lawrence-schlossman.png";
import maryannImg from "@/assets/maryann-santos.png";
import skylarImg from "@/assets/skylar-marshai.png";
import teairaImg from "@/assets/teaira-walker.png";
import aimeeSongImg from "@/assets/aimee-song.jpg";
import camilaCoelhoImg from "@/assets/camila-coelho.jpg";
import chriselleLimImg from "@/assets/chriselle-lim.jpg";
import daniAustinImg from "@/assets/dani-austin.jpg";
import hoangKimCungImg from "@/assets/hoang-kim-cung.jpg";
import aylinImg from "@/assets/Aylin.jpg";

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
  { id: "julia", name: "Julia Sarr-Jamois", from: "London, England", img: juliaImg, category: "Streetwear & Casual", instagram: "https://instagram.com/juliasarrjamois" },
  { id: "jourdan", name: "Jourdan Riane", from: "Essex, England", img: jourdanRianeImg, category: "Red Carpet & Editorial", instagram: "https://instagram.com/jourdanriane" },
  { id: "lawrence", name: "Lawrence Schlossman", from: "New York, USA", img: lawrenceImg, category: "Streetwear & Casual", instagram: "https://instagram.com/lawrenceschlossman" },
  { id: "maysa1", name: "Maysa Shems", from: "Nigeria / USA", img: maysaImg1, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/maysashems" },
  { id: "maryann", name: "Maryann Santos", from: "USA", img: maryannImg, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/styleby.ms" },
  { id: "hannah", name: "Hannah Harrell", from: "USA", img: hannahImg, category: "Classic & Tailored", instagram: "https://instagram.com/hannahharrell_", ltk: "https://www.shopltk.com/explore/hannahharrell_" },
  { id: "skylar", name: "Skylar Marshai", from: "USA", img: skylarImg, category: "Streetwear & Casual", instagram: "https://www.instagram.com/skylarmarshai/" },
  { id: "teaira", name: "Teaira Walker", from: "USA", img: teairaImg, category: "Avant-Garde & Eclectic", instagram: "https://www.instagram.com/teairawalker/" },
  { id: "camila", name: "Camila Coelho", from: "Los Angeles, USA", img: camilaCoelhoImg, category: "Red Carpet & Editorial", instagram: "https://instagram.com/camilacoelho", ltk: "https://www.shopltk.com/explore/camilacoelho" },
  { id: "chriselle", name: "Chriselle Lim", from: "Los Angeles, USA", img: chriselleLimImg, category: "Red Carpet & Editorial", instagram: "https://instagram.com/chrisellelim", ltk: "https://www.shopltk.com/explore/chrisellelim" },
  { id: "aimee", name: "Aimee Song", from: "Los Angeles, USA", img: aimeeSongImg, category: "Avant-Garde & Eclectic", instagram: "https://instagram.com/aimeesong", ltk: "https://www.shopltk.com/explore/AimeeSong" },
  { id: "dani", name: "Dani Austin", from: "Dallas, USA", img: daniAustinImg, category: "Classic & Tailored", instagram: "https://instagram.com/daniaustin", ltk: "https://www.shopltk.com/explore/daniaustin" },
  { id: "hoangkim", name: "Hoang-Kim Cung", from: "Dallas, USA", img: hoangKimCungImg, category: "Classic & Tailored", instagram: "https://instagram.com/hkcung", ltk: "https://www.shopltk.com/explore/hkcung" },
  { id: "aylin", name: "Aylin", from: "USA", img: aylinImg, category: "Classic & Tailored", instagram: "https://instagram.com/stylinbyaylin", ltk: "https://www.shopltk.com/explore/stylinbyaylin" },
];

export const categories = ["Streetwear & Casual", "Red Carpet & Editorial", "Classic & Tailored", "Avant-Garde & Eclectic"];
