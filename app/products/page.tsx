"use client";

import { useState, useEffect } from "react";
import { Filter, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AuthRequired } from "@/components/auth-required";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [authError, setAuthError] = useState(false);

  // Check auth on mount
  useEffect(() => {
    fetch("/auth/profile")
      .then((res) => {
        if (res.status === 401) {
          setAuthError(true);
        }
      })
      .catch(() => {
        setAuthError(true);
      });
  }, []);

  // Show auth required screen if unauthorized
  if (authError) {
    return (
      <AuthRequired
        title="Products Catalog"
        message="Please log in to view our product catalog."
      />
    );
  }

  const categories = [
    { id: "all", name: "All Products" },
    { id: "rackets", name: "Rackets" },
    { id: "shuttlecocks", name: "Shuttlecocks" },
    { id: "shoes", name: "Shoes" },
    { id: "apparel", name: "Apparel" },
    { id: "accessories", name: "Accessories" },
  ];

  const products = [
    {
      id: 1,
      name: "Yonex Arcsaber 11",
      category: "rackets",
      price: "$299.99",
      originalPrice: "$349.99",
      rating: 4.8,
      reviews: 124,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Yonex",
      description:
        "Professional-grade racket with exceptional control and power.",
      features: ["Carbon fiber frame", "Isometric head shape", "Medium flex"],
      inStock: true,
    },
    {
      id: 2,
      name: "Victor Jetspeed S 12",
      category: "rackets",
      price: "$189.99",
      rating: 4.6,
      reviews: 89,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Victor",
      description: "Speed-focused racket perfect for aggressive players.",
      features: ["Nano Fortify TR", "Aerodynamic frame", "Stiff flex"],
      inStock: true,
    },
    {
      id: 3,
      name: "Yonex Mavis 350",
      category: "shuttlecocks",
      price: "$24.99",
      rating: 4.5,
      reviews: 256,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Yonex",
      description:
        "Durable synthetic shuttlecocks for training and recreational play.",
      features: ["Synthetic feathers", "Consistent flight", "Pack of 6"],
      inStock: true,
    },
    {
      id: 4,
      name: "Yonex Power Cushion 65 Z3",
      category: "shoes",
      price: "$159.99",
      originalPrice: "$179.99",
      rating: 4.7,
      reviews: 178,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Yonex",
      description: "Lightweight court shoes with superior cushioning and grip.",
      features: ["Power Cushion+", "Durable Skin Light", "Ergoshape"],
      inStock: false,
    },
    {
      id: 5,
      name: "Li-Ning Turbo Charging 75",
      category: "rackets",
      price: "$249.99",
      rating: 4.4,
      reviews: 67,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Li-Ning",
      description: "Powerful racket designed for attacking play style.",
      features: ["TB Nano", "Dynamic-Optimum Frame", "Extra stiff"],
      inStock: true,
    },
    {
      id: 6,
      name: "Yonex Team Polo Shirt",
      category: "apparel",
      price: "$49.99",
      rating: 4.3,
      reviews: 92,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Yonex",
      description:
        "Comfortable and breathable polo shirt for training and matches.",
      features: ["Moisture-wicking", "UV protection", "Multiple colors"],
      inStock: true,
    },
    {
      id: 7,
      name: "Victor Grip Tape",
      category: "accessories",
      price: "$8.99",
      rating: 4.6,
      reviews: 143,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Victor",
      description: "High-quality grip tape for enhanced racket handling.",
      features: ["Anti-slip surface", "Sweat absorption", "Easy application"],
      inStock: true,
    },
    {
      id: 8,
      name: "Carlton Aeroblade 6000",
      category: "rackets",
      price: "$129.99",
      rating: 4.2,
      reviews: 54,
      image: "/images/IMG_7062.jpg?height=300&width=300",
      brand: "Carlton",
      description: "Versatile racket suitable for intermediate players.",
      features: ["Graphite construction", "Even balance", "Medium flex"],
      inStock: true,
    },
  ];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 pt-20">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Premium Badminton
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
              {" "}
              Equipment
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover our extensive collection of professional badminton
            equipment from top brands. Visit our store to purchase and get
            expert advice.
          </p>
          <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-full inline-block">
            <span className="font-semibold">
              Visit our store to purchase • Expert advice included
            </span>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full w-64"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48 rounded-full">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-gray-600">
              Showing {filteredProducts.length} products
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm overflow-hidden"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                      Sale
                    </Badge>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Badge
                        variant="secondary"
                        className="text-white bg-gray-800"
                      >
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {product.brand}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                  <ul className="space-y-1">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center text-xs text-gray-600"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.reviews} reviews
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-full transition-all duration-300 transform hover:scale-105"
                    disabled={!product.inStock}
                  >
                    {product.inStock ? "View Details" : "Out of Stock"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Store Visit CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Get Your Equipment?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Visit our store to see, feel, and test the equipment before
            purchasing. Our experts will help you find the perfect gear for your
            playing style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Get Directions
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
            >
              Call Store
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
