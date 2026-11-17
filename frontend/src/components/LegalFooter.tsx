import React from 'react';
import { Shield, Sparkles, Scale, HeartHandshake } from 'lucide-react';

export const LegalFooter: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-white/10 bg-[#0B0F19] text-gray-400 py-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Legal Disclaimer Box */}
        <div className="p-6 rounded-3xl bg-[#151C2C]/50 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-2 text-gold font-bold text-sm mb-2">
            <Scale className="w-4 h-4 text-gold" />
            <span>Aviso Legal y Descargo de Responsabilidad</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>DataChance CO</strong> es una plataforma de análisis tecnológico, matemático y estadístico de carácter estrictamente <strong>informativo y educativo</strong>. Esta aplicación <strong>NO realiza, comercializa, procesa ni intermedia apuestas ni venta de chances o loterías en línea</strong>. Las marcas, nombres y logos de los sorteos (Coljuegos, Baloto, Loterías Departamentales y Redes de Chance autorizadas) pertenecen exclusivamente a sus respectivos titulares y se citan únicamente con fines descriptivos e informativos.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
            <HeartHandshake className="w-4 h-4" />
            <span>Fomentamos el juego responsable en Colombia. El azar debe ser tomado como entretenimiento. Mayores de 18 años.</span>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-neon-emerald" />
            </div>
            <span>© {new Date().getFullYear()} DataChance CO • Plataforma Fintech de Inteligencia Probabilística</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="hover:text-white transition-colors cursor-pointer">Términos de Uso</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Política de Privacidad</span>
            <span>•</span>
            <span className="hover:text-white transition-colors cursor-pointer">Coljuegos Colombia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
