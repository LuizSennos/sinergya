"use client";

import { useState } from "react";
import Image from "next/image";
import { apiLGPDConsent } from "@/lib/api";

interface Props {
  onAccept: () => void;
}

export default function LGPDConsentPage({ onAccept }: Props) {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  async function handleAccept() {
    setLoading(true);
    try {
      await apiLGPDConsent(true);
      onAccept();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-sinergya-dark/95 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-white" style={{ background: "linear-gradient(135deg, #0F172A, #1e293b)" }}>
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="Sinergya" width={140} height={40} />
          </div>
          <h1 className="text-xl font-bold text-center">Termo de Consentimento</h1>
          <p className="text-sm text-white/50 text-center mt-1">Lei Geral de Proteção de Dados — LGPD</p>
        </div>

        <div className="px-8 py-6 space-y-4 max-h-64 overflow-y-auto text-sm text-slate-600 leading-relaxed">
          <p>Ao utilizar a plataforma <strong>Sinergya</strong>, você concorda com o tratamento dos seus dados pessoais e dados de saúde conforme descrito abaixo:</p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="text-sinergya-green font-bold mt-0.5">1.</span>
              <p><strong>Coleta de dados:</strong> Coletamos dados de identificação (nome, e-mail) e dados clínicos necessários para o acompanhamento de saúde.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-sinergya-green font-bold mt-0.5">2.</span>
              <p><strong>Finalidade:</strong> Os dados são utilizados exclusivamente para comunicação entre pacientes e equipe de saúde dentro da plataforma.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-sinergya-green font-bold mt-0.5">3.</span>
              <p><strong>Compartilhamento:</strong> Dados clínicos são compartilhados somente com profissionais da equipe vinculados ao seu cuidado.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-sinergya-green font-bold mt-0.5">4.</span>
              <p><strong>Segurança:</strong> Todos os dados são armazenados com criptografia e acesso controlado por perfil de usuário.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-sinergya-green font-bold mt-0.5">5.</span>
              <p><strong>Direitos:</strong> Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento através do administrador da plataforma.</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-sinergya-green"
            />
            <span className="text-sm text-slate-700">
              Li e concordo com o tratamento dos meus dados pessoais conforme descrito acima, em conformidade com a LGPD (Lei nº 13.709/2018).
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!checked || loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40 transition-all"
            style={{ background: "linear-gradient(135deg, #4FBF9F, #3A7BD5)" }}
          >
            {loading ? "Registrando..." : "Aceitar e continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
