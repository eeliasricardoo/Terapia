import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle2, Star, ShieldCheck, Heart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                    Terapia Online Segura
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                    Salud mental <br />
                    <span className="text-primary">sin fronteras.</span>
                  </h1>
                  <p className="max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed">
                    Conéctate con psicólogos que hablan tu idioma y entienden tu cultura.
                    Atención acogedora, dondequiera que estés.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="rounded-full px-8 text-lg h-12 shadow-xl shadow-primary/20" asChild>
                    <Link href="/especialistas">Buscar Especialista</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-8 text-lg h-12 border-primary/20 hover:bg-primary/5" asChild>
                    <Link href="/sobre">Cómo Funciona</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                        {/* Placeholder avatars */}
                        <div className="w-full h-full bg-primary/20"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex text-accent">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <span className="font-medium text-foreground">4.9/5</span>
                    <span>de valoraciones</span>
                  </div>
                </div>
              </div>

              {/* Hero Image / Visual */}
              <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden bg-secondary/30 border border-primary/10 shadow-2xl">
                  {/* Abstract Shapes / Placeholder for Image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20"></div>
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>

                  {/* Floating Cards */}
                  <Card className="absolute top-12 right-8 p-4 flex items-center gap-3 shadow-lg bg-white/80 backdrop-blur animate-bounce duration-[3000ms]">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Estado</p>
                      <p className="text-sm font-bold text-foreground">100% Seguro</p>
                    </div>
                  </Card>

                  <Card className="absolute bottom-12 left-8 p-4 flex items-center gap-3 shadow-lg bg-white/80 backdrop-blur animate-bounce duration-[4000ms]">
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Heart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Especialistas</p>
                      <p className="text-sm font-bold text-foreground">Acogedores</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Value Prop */}
        <section className="py-16 md:py-24 bg-white/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Especialistas Verificados</h3>
                <p className="text-muted-foreground">
                  Todos los profesionales pasan por un riguroso proceso de verificación de credenciales.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Sesiones Online</h3>
                <p className="text-muted-foreground">
                  Haz terapia desde la comodidad de tu casa, con total privacidad y seguridad.
                </p>
              </div>
              <div className="flex flex-col items-start space-y-4 p-6 rounded-2xl bg-background border border-border/50 hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Precios Accesibles</h3>
                <p className="text-muted-foreground">
                  Encuentra profesionales que se ajusten a tu presupuesto. La salud mental es para todos.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
