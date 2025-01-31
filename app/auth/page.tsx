"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { motion } from "framer-motion";
import "../../styles/bacground.css";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");

  return (
    <div className="area min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-orange-950 dark:via-background dark:to-orange-950 flex items-center justify-center p-4">
      <ul className="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <h1 className="bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent md:text-6xl text-3xl mb-2 font-bold tracking-tight leading-tight">
            P2P Trader
          </h1>
          <p className="text-muted-foreground mt-2">
            Join our trusted community of peer-to-peer traders
          </p>
        </div>

        <div className="bg-card border rounded-xl shadow-lg shadow-orange-900/5 overflow-hidden">
          <Tabs
            defaultValue="login"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="w-full grid grid-cols-2 rounded-none bg-muted/50">
              <TabsTrigger
                value="login"
                className="rounded-none data-[state=active]:bg-background"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-none data-[state=active]:bg-background"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <div className="p-6">
              <TabsContent value="login" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Welcome back
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your credentials to access your account
                  </p>
                </div>
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-0 space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Create an account
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your details to join our community
                  </p>
                </div>
                <SignupForm />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          By continuing, you agree to our{" "}
          <a
            href="#"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
