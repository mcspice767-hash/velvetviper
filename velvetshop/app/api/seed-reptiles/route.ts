import { supabase } from "../../../lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const REPTILE_DATA = [
  {
    species: "Bearded Dragon",
    name: "Atlas",
    location: "Los Angeles, CA",
    country: "USA",
    price: 250,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
    description:
      "Stunning Bearded Dragon with vibrant colors and excellent temperament. Very docile, great for beginners. Feeds regularly and loves handling. Comes with full care guide.",
    unsplashQuery: "bearded dragon reptile",
  },
  {
    species: "Leopard Gecko",
    name: "Luna",
    location: "Miami, FL",
    country: "USA",
    price: 150,
    gender: "Female",
    health: "Healthy",
    availability: "Available",
    description:
      "Beautiful Leopard Gecko with unique spot patterns. Calm and easy to care for. Perfect for apartment living. Active feeder, excellent health.",
    unsplashQuery: "leopard gecko",
  },
  {
    species: "Crested Gecko",
    name: "Emerald",
    location: "Seattle, WA",
    country: "USA",
    price: 120,
    gender: "Male",
    health: "Healthy",
    availability: "Available",
    description:
      "Charming Crested Gecko with beautiful green coloration. Quiet and easy to care for. Great for apartment dwellers. Enjoys climbing and exploring.",
    unsplashQuery: "crested gecko green",
  },
  {
    species: "Ball Python",
    name: "Obsidian",
    location: "Austin, TX",
    country: "USA",
    price: 200,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
    description:
      "Gorgeous Ball Python with deep color morph. Docile and handleable. Perfect for intermediate keepers. Eats well and grows steadily. Beautiful addition to any collection.",
    unsplashQuery: "ball python",
  },
  {
    species: "Corn Snake",
    name: "Blaze",
    location: "Denver, CO",
    country: "USA",
    price: 180,
    gender: "Female",
    health: "Healthy",
    availability: "Available",
    description:
      "Vibrant Corn Snake with striking red and orange patterns. Excellent beginner snake. Docile, easy to handle, and regularly feeds. Beautiful and rewarding pet.",
    unsplashQuery: "corn snake red",
  },
  {
    species: "Blue-Tongued Skink",
    name: "Thor",
    location: "Portland, OR",
    country: "USA",
    price: 300,
    gender: "Male",
    health: "Healthy",
    availability: "Available",
    description:
      "Impressive Blue-Tongued Skink with stocky build and amazing blue tongue. Friendly and curious. Requires spacious enclosure but worth the effort. Long-lived companion.",
    unsplashQuery: "blue tongued skink",
  },
  {
    species: "Veiled Chameleon",
    name: "Pharaoh",
    location: "Phoenix, AZ",
    country: "USA",
    price: 280,
    gender: "Male",
    health: "Healthy",
    availability: "Available",
    description:
      "Magnificent Veiled Chameleon with impressive casque. Males are territorial but stunning to observe. Advanced keeper recommended. Color changing abilities mesmerize.",
    unsplashQuery: "veiled chameleon",
  },
  {
    species: "Green Iguana",
    name: "Kai",
    location: "San Diego, CA",
    country: "USA",
    price: 220,
    gender: "Male",
    health: "Needs Care",
    availability: "Available",
    description:
      "Large and impressive Green Iguana with brilliant green coloration. Requires significant space and specialized care. Rewarding for experienced keepers.",
    unsplashQuery: "green iguana",
  },
  {
    species: "Russian Tortoise",
    name: "Gatsby",
    location: "New York, NY",
    country: "USA",
    price: 320,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
    description:
      "Ancient Russian Tortoise ready for long-term companionship. Herbivorous and easy to feed. Can live 50+ years. Requires outdoor space. Gentle and personable.",
    unsplashQuery: "russian tortoise",
  },
  {
    species: "King Snake",
    name: "Shadow",
    location: "Chicago, IL",
    country: "USA",
    price: 160,
    gender: "Female",
    health: "Healthy",
    availability: "Available",
    description:
      "Powerful King Snake with striking pattern. Highly adaptable and hardy. Excellent feeders. Known for cannibalistic tendencies so house alone. Great snakes.",
    unsplashQuery: "king snake black white",
  },
  {
    species: "Milk Snake",
    name: "Scarlet",
    location: "Boston, MA",
    country: "USA",
    price: 140,
    gender: "Female",
    health: "Healthy",
    availability: "Available",
    description:
      "Gorgeous Milk Snake with red, white and black banding. Docile and easy to care for. Great for beginners. Regularly feeds and healthy. Beautiful species.",
    unsplashQuery: "milk snake red",
  },
  {
    species: "Ackie Monitor",
    name: "Apex",
    location: "Houston, TX",
    country: "USA",
    price: 350,
    gender: "Male",
    health: "Healthy",
    availability: "Available",
    description:
      "Athletic Ackie Monitor with impressive size. Active and curious. Requires large enclosure and experienced keeper. Rewards dedicated hobbyists. Fascinating behavior.",
    unsplashQuery: "ackie monitor",
  },
  {
    species: "Savannah Monitor",
    name: "Titan",
    location: "Las Vegas, NV",
    country: "USA",
    price: 280,
    gender: "Male",
    health: "Healthy",
    availability: "Available",
    description:
      "Powerful Savannah Monitor with golden patterns. Strong personality and curiosity. Advanced care required. Creates amazing interactive experiences. Commands respect.",
    unsplashQuery: "savannah monitor",
  },
  {
    species: "African Fat-Tailed Gecko",
    name: "Cleo",
    location: "Atlanta, GA",
    country: "USA",
    price: 200,
    gender: "Female",
    health: "Vaccinated",
    availability: "Available",
    description:
      "Charming African Fat-Tailed Gecko with stocky build and fat tail. Docile and handleable. Similar care to leopard geckos. Excellent beginner reptile. Unique appearance.",
    unsplashQuery: "african fat tailed gecko",
  },
  {
    species: "Panther Chameleon",
    name: "Eclipse",
    location: "Miami, FL",
    country: "USA",
    price: 350,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
    description:
      "Spectacular Panther Chameleon with dramatic color patterns. Males display incredible colors. Advanced care essential. Stunning color-changing abilities. Show-stopper.",
    unsplashQuery: "panther chameleon",
  },
  {
    species: "Boa Constrictor",
    name: "Coil",
    location: "Miami, FL",
    country: "USA",
    price: 320,
    gender: "Male",
    health: "Healthy",
    availability: "Available",
    description:
      "Impressive Boa Constrictor with muscular build and beautiful pattern. Docile once acclimated. Requires space for growth. Long-lived and rewarding. Classic beauty.",
    unsplashQuery: "boa constrictor",
  },
  {
    species: "Sulcata Tortoise",
    name: "Hercules",
    location: "San Diego, CA",
    country: "USA",
    price: 400,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
    description:
      "Magnificent Sulcata Tortoise with impressive size and personality. Long-lived, herbivorous companion. Requires outdoor space. Creates lasting bonds with owners.",
    unsplashQuery: "sulcata tortoise",
  },
  {
    species: "Hognose Snake",
    name: "Noodle",
    location: "Portland, OR",
    country: "USA",
    price: 130,
    gender: "Female",
    health: "Healthy",
    availability: "Available",
    description:
      "Entertaining Hognose Snake with unique upturned snout. Playful personality and entertaining behavior. Great feeders. Docile and easy to handle. Quirky charm.",
    unsplashQuery: "hognose snake",
  },
  {
    species: "Green Tree Python",
    name: "Jade",
    location: "Miami, FL",
    country: "USA",
    price: 280,
    gender: "Male",
    health: "Vaccinated",
    availability: "Available",
    description:
      "Striking Green Tree Python with brilliant lime coloration. Arboreal specialist. Advanced care required. Unique coiled resting posture. Exotic and beautiful.",
    unsplashQuery: "green tree python",
  },
  {
    species: "Gargoyle Gecko",
    name: "Echo",
    location: "New York, NY",
    country: "USA",
    price: 180,
    gender: "Female",
    health: "Healthy",
    availability: "Available",
    description:
      "Adorable Gargoyle Gecko with unique horned appearance. Docile and easy to care for. Great for apartment living. Sticky toe pads fascinate observers. Modern gecko care.",
    unsplashQuery: "gargoyle gecko",
  },
];

async function getUnsplashImage(query: string): Promise<string> {
  try {
    // Using a default professional reptile image from Unsplash collections
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query
      )}&count=1&client_id=f7mWN0WfLAeI96sKEpA3-UqVLuqKf_r9d7gC0tEbC2w`
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].urls.regular;
    }
  } catch (error) {
    console.error("Error fetching image:", error);
  }

  // Fallback to a generic placeholder
  return "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seed = searchParams.get("seed");

    if (seed !== "velvetshop2026") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Starting to seed 20 reptile listings...");

    const insertData = await Promise.all(
      REPTILE_DATA.map(async (reptile) => {
        const imageUrl = await getUnsplashImage(reptile.unsplashQuery);
        return {
          ...reptile,
          image_url: imageUrl,
          images: [imageUrl],
          status: "approved",
          payment_status: "paid",
          featured: Math.random() > 0.7,
        };
      })
    );

    const { error } = await supabase.from("listings").insert(insertData);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "✅ Successfully seeded 20 reptile listings!",
      count: insertData.length,
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
