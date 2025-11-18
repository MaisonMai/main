/*
  # Add Country and Currency Support

  ## Changes Made
  
  1. Modifications to `profiles` table
    - Add `country` column (text, ISO 3166-1 alpha-2 country code, default 'US')
    - Add `currency` column (text, ISO 4217 currency code, default 'USD')
    - Add `locale` column (text, for formatting preferences, default 'en-US')
  
  2. Notes
    - Country codes follow ISO 3166-1 alpha-2 standard (e.g., 'US', 'GB', 'CA')
    - Currency codes follow ISO 4217 standard (e.g., 'USD', 'GBP', 'EUR')
    - Locale codes for proper number/date formatting (e.g., 'en-US', 'en-GB', 'fr-FR')
    - Existing users will default to US/USD/en-US
*/

-- Add country, currency, and locale fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text DEFAULT 'US' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'currency'
  ) THEN
    ALTER TABLE profiles ADD COLUMN currency text DEFAULT 'USD' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'locale'
  ) THEN
    ALTER TABLE profiles ADD COLUMN locale text DEFAULT 'en-US' NOT NULL;
  END IF;
END $$;

-- Create a function to set currency and locale based on country
CREATE OR REPLACE FUNCTION get_currency_for_country(country_code text)
RETURNS text AS $$
BEGIN
  RETURN CASE country_code
    WHEN 'US' THEN 'USD'
    WHEN 'GB' THEN 'GBP'
    WHEN 'CA' THEN 'CAD'
    WHEN 'AU' THEN 'AUD'
    WHEN 'NZ' THEN 'NZD'
    WHEN 'JP' THEN 'JPY'
    WHEN 'KR' THEN 'KRW'
    WHEN 'IN' THEN 'INR'
    WHEN 'SG' THEN 'SGD'
    WHEN 'BR' THEN 'BRL'
    WHEN 'MX' THEN 'MXN'
    WHEN 'AR' THEN 'ARS'
    WHEN 'CL' THEN 'CLP'
    WHEN 'ZA' THEN 'ZAR'
    WHEN 'AE' THEN 'AED'
    WHEN 'SA' THEN 'SAR'
    WHEN 'CH' THEN 'CHF'
    WHEN 'NO' THEN 'NOK'
    WHEN 'SE' THEN 'SEK'
    WHEN 'DK' THEN 'DKK'
    WHEN 'DE' THEN 'EUR'
    WHEN 'FR' THEN 'EUR'
    WHEN 'IT' THEN 'EUR'
    WHEN 'ES' THEN 'EUR'
    WHEN 'NL' THEN 'EUR'
    WHEN 'BE' THEN 'EUR'
    WHEN 'AT' THEN 'EUR'
    WHEN 'IE' THEN 'EUR'
    WHEN 'FI' THEN 'EUR'
    ELSE 'USD'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_locale_for_country(country_code text)
RETURNS text AS $$
BEGIN
  RETURN CASE country_code
    WHEN 'US' THEN 'en-US'
    WHEN 'GB' THEN 'en-GB'
    WHEN 'CA' THEN 'en-CA'
    WHEN 'AU' THEN 'en-AU'
    WHEN 'NZ' THEN 'en-NZ'
    WHEN 'IE' THEN 'en-IE'
    WHEN 'SG' THEN 'en-SG'
    WHEN 'ZA' THEN 'en-ZA'
    WHEN 'IN' THEN 'en-IN'
    WHEN 'DE' THEN 'de-DE'
    WHEN 'FR' THEN 'fr-FR'
    WHEN 'IT' THEN 'it-IT'
    WHEN 'ES' THEN 'es-ES'
    WHEN 'NL' THEN 'nl-NL'
    WHEN 'BE' THEN 'nl-BE'
    WHEN 'SE' THEN 'sv-SE'
    WHEN 'NO' THEN 'nb-NO'
    WHEN 'DK' THEN 'da-DK'
    WHEN 'FI' THEN 'fi-FI'
    WHEN 'CH' THEN 'de-CH'
    WHEN 'AT' THEN 'de-AT'
    WHEN 'JP' THEN 'ja-JP'
    WHEN 'KR' THEN 'ko-KR'
    WHEN 'BR' THEN 'pt-BR'
    WHEN 'MX' THEN 'es-MX'
    WHEN 'AR' THEN 'es-AR'
    WHEN 'CL' THEN 'es-CL'
    WHEN 'AE' THEN 'ar-AE'
    WHEN 'SA' THEN 'ar-SA'
    ELSE 'en-US'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
