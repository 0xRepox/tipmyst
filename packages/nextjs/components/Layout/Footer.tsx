export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About TipMyst</h3>
            <p className="text-gray-600 text-sm">
              A confidential tipping platform powered by FHEVM technology. 
              Send tips privately using fully homomorphic encryption.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://docs.zama.ai/fhevm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  FHEVM Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/zama-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Zama GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.zama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700"
                >
                  Zama Website
                </a>
              </li>
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="font-bold text-lg mb-4">Built With</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>⚡ Next.js 14</li>
              <li>🔐 FHEVM SDK</li>
              <li>🔗 Wagmi & Viem</li>
              <li>🎨 Tailwind CSS</li>
              <li>📜 Solidity</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          <p>
            Built for the{' '}
            <a
              href="https://www.zama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Zama Bounty Program
            </a>
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} TipMyst. Licensed under BSD-3-Clause-Clear.
          </p>
        </div>
      </div>
    </footer>
  );
}