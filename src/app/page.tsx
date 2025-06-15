'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      // Redirect directly to ask page with the question
      const params = new URLSearchParams();
      params.set('q', question);
      router.push(`/ask?${params.toString()}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welkom bij WetHelder
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Uw betrouwbare bron voor juridische vragen en antwoorden
          </p>

          {/* Zoekformulier */}
          <div className="max-w-3xl mx-auto mb-12">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="sr-only">Uw vraag</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Stel hier uw juridische vraag..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Vraag stellen
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">
                💡 <strong>Tip:</strong> In het chatvenster kun je je functieprofiel instellen voor een beter antwoord op maat
              </p>
            </form>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Hoe werkt het?
            </h2>
            <p className="text-gray-600 mb-6">
              WetHelder maakt juridische informatie toegankelijk voor iedereen. 
              Stel uw vraag en ontvang direct een duidelijk antwoord, gebaseerd op 
              actuele wetgeving en jurisprudentie.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Gratis Account
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>✓ 2 gratis vragen</li>
                  <li>✓ Directe antwoorden</li>
                  <li>✓ Toegang tot basisinformatie</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Geregistreerde Gebruiker
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li>✓ Onbeperkt vragen stellen</li>
                  <li>✓ Persoonlijke vraaggeschiedenis</li>
                  <li>✓ Favorieten opslaan</li>
                  <li>✓ Uitgebreide antwoorden</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="mt-4 text-gray-500">
              Nog geen account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Registreer nu
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 