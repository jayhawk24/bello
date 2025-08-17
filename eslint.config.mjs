import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow unused variables (warnings won't fail build)
      "@typescript-eslint/no-unused-vars": "warn",
      
      // Allow any types for now (to be fixed later)
      "@typescript-eslint/no-explicit-any": "warn",
      
      // Allow empty object types
      "@typescript-eslint/no-empty-object-type": "warn",
      
      // Allow unescaped entities in JSX
      "react/no-unescaped-entities": "warn",
      
      // Allow missing dependencies in useEffect (warnings only)
      "react-hooks/exhaustive-deps": "warn",
    }
  }
];

export default eslintConfig;
