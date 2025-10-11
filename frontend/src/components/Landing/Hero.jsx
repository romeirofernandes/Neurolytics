"use client";

import { ArrowRight } from "lucide-react";
import Navbar from "./Navbar";
import { useTheme } from "@/context/ThemeContext";
import { useNavigate } from "react-router-dom";

const Hero2 = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradient background with grain effect */}
      <div
        className="flex flex-col items-end absolute -right-60 -top-10 blur-xl z-0 ">
        <div
          className="h-[10rem] rounded-full w-[60rem] z-1 blur-[6rem]"
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(to bottom, #8b5cf6, #06b6d4)'
              : 'linear-gradient(to bottom, #a855f7, #0ea5e9)'
          }}></div>
        <div
          className="h-[10rem] rounded-full w-[90rem] z-1 blur-[6rem]"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, #ec4899, #fbbf24)'
              : 'linear-gradient(to bottom, #e879f9, #f59e0b)'
          }}></div>
        <div
          className="h-[10rem] rounded-full w-[60rem] z-1 blur-[6rem]"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(to bottom, #f59e0b, #0ea5e9)'
              : 'linear-gradient(to bottom, #fb923c, #3b82f6)'
          }}></div>
      </div>
      <div className="absolute inset-0 z-0 bg-noise opacity-30"></div>
      {/* Content container */}
      <div className="relative z-10">
        <Navbar />

        {/* Badge */}
        <div
          className="mx-auto mt-6 flex max-w-fit items-center justify-center space-x-2 rounded-full bg-card/10 px-4 py-2 backdrop-blur-sm border border-border/20">
          <span className="text-sm font-medium text-foreground">
            Democratizing cognitive science research
          </span>
          <ArrowRight className="h-4 w-4 text-foreground" />
        </div>

        {/* Hero section */}
        <div className="container mx-auto mt-12 px-4 text-center">
          <h1
            className="mx-auto max-w-4xl text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            Build Behavioral Experiments in Your Browser
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            A secure, no-code/low-code SaaS platform empowering researchers to deploy high-precision cognitive experiments online with lab-grade accuracy.
          </p>
          <div
            className="mt-10 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
            <button
              onClick={() => navigate('/register')}
              className="h-12 rounded-full bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90">
              Get Started
            </button>
          </div>

          <div className="relative mx-auto my-20 w-full max-w-6xl">
            <div
              className="absolute inset-0 rounded shadow-lg bg-card blur-[10rem] bg-grainy opacity-20" />

            {/* Hero Image */}
            <img
              src="https://kikxai.netlify.app/_next/image?url=%2Fassets%2Fhero-image.png&w=1920&q=75"
              alt="Hero Image"
              className="relative w-full h-auto shadow-md grayscale-100 rounded border border-border" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Hero2 };
