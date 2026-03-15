"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddressForm() {
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label || undefined,
          street,
          city,
          state,
          postalCode,
          country,
        }),
      });
      setLabel("");
      setStreet("");
      setCity("");
      setState("");
      setPostalCode("");
      setCountry("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <Input
        placeholder="Label (e.g. Home)"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <Input
        placeholder="Street"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
        required
      />
      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
        <Input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          placeholder="Postal code"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required
        />
        <Input
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add address"}
      </Button>
    </form>
  );
}
