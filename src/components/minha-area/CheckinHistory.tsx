import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Scale, Camera } from "lucide-react";

interface CheckinHistoryProps {
  checkins: any[];
}

const CheckinHistory = ({ checkins }: CheckinHistoryProps) => {
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUrls = async () => {
      const urls: Record<string, string> = {};
      for (const checkin of checkins) {
        for (const field of ["photo_front", "photo_side", "photo_back"]) {
          if (checkin[field]) {
            const { data } = await supabase.storage.from("client-photos").createSignedUrl(checkin[field], 3600);
            if (data?.signedUrl) urls[`${checkin.id}-${field}`] = data.signedUrl;
          }
        }
      }
      setPhotoUrls(urls);
    };
    if (checkins.length > 0) loadUrls();
  }, [checkins]);

  if (checkins.length === 0) {
    return <p className="text-muted-foreground text-sm">Nenhum check-in enviado ainda.</p>;
  }

  const photoLabels: Record<string, string> = {
    photo_front: "Frente",
    photo_side: "Lado",
    photo_back: "Costas",
  };

  return (
    <div className="space-y-4">
      {checkins.map((checkin) => {
        const hasPhotos = checkin.photo_front || checkin.photo_side || checkin.photo_back;
        return (
          <div key={checkin.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {new Date(checkin.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
              </span>
              {checkin.weight && (
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Scale size={14} className="text-primary" />
                  {checkin.weight} kg
                </div>
              )}
            </div>
            {checkin.notes && (
              <p className="text-sm text-muted-foreground">{checkin.notes}</p>
            )}
            {hasPhotos && (
              <div className="grid grid-cols-3 gap-2">
                {["photo_front", "photo_side", "photo_back"].map((field) => {
                  if (!checkin[field]) return null;
                  const url = photoUrls[`${checkin.id}-${field}`];
                  return (
                    <div key={field} className="space-y-1">
                      <span className="text-xs text-muted-foreground">{photoLabels[field]}</span>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={photoLabels[field]} className="w-full aspect-[3/4] object-cover rounded-md border border-border" />
                        </a>
                      ) : (
                        <div className="w-full aspect-[3/4] rounded-md border border-border bg-muted animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CheckinHistory;
