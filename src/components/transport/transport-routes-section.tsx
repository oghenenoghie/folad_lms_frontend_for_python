import { Route, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransportRouteFormDialog } from "@/components/transport/transport-route-form-dialog";
import { RouteStopFormDialog } from "@/components/transport/route-stop-form-dialog";
import { DeleteConfirmButton } from "@/components/schools/delete-confirm-button";
import { getTransportRoutes, getRouteStops, type TransportRoute } from "@/lib/transport";
import {
  createTransportRoute,
  updateTransportRoute,
  deleteTransportRoute,
  createRouteStop,
  updateRouteStop,
  deleteRouteStop,
} from "@/lib/actions/transport";
import { transportRouteDefaults, routeStopDefaults } from "@/lib/transport-forms";

async function RouteCard({ schoolId, route }: { schoolId: string; route: TransportRoute }) {
  const stops = await getRouteStops(route.public_id);

  return (
    <div className="rounded-lg border">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <span className="font-medium">{route.name}</span>
          {route.description && <p className="text-xs text-muted-foreground">{route.description}</p>}
        </div>
        <div className="flex items-center gap-1">
          <TransportRouteFormDialog
            trigger={
              <Button variant="ghost" size="icon-sm">
                <Pencil className="h-4 w-4" />
              </Button>
            }
            title="Edit route"
            defaultValues={{ name: route.name, description: route.description }}
            action={updateTransportRoute.bind(null, schoolId, route.public_id)}
          />
          <DeleteConfirmButton
            description={`Delete route ${route.name}? This cannot be undone.`}
            action={deleteTransportRoute.bind(null, schoolId, route.public_id)}
          />
        </div>
      </div>

      {stops !== null && (
        <div className="px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stops</p>
            <RouteStopFormDialog
              trigger={
                <button type="button" className="text-xs font-medium text-primary hover:underline">
                  + Add stop
                </button>
              }
              title={`New stop (${route.name})`}
              defaultValues={routeStopDefaults}
              action={createRouteStop.bind(null, schoolId, route.public_id)}
            />
          </div>
          {stops.length === 0 ? (
            <p className="text-sm text-muted-foreground">No stops yet.</p>
          ) : (
            <div className="space-y-1.5">
              {stops.map((stop) => (
                <div
                  key={stop.public_id}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5 text-sm"
                >
                  <span>
                    {stop.sequence}. {stop.name}
                    <span className="text-muted-foreground"> — {stop.pickup_time.slice(0, 5)}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <RouteStopFormDialog
                      trigger={
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      }
                      title="Edit stop"
                      defaultValues={{
                        name: stop.name,
                        sequence: stop.sequence,
                        pickup_time: stop.pickup_time.slice(0, 5),
                      }}
                      action={updateRouteStop.bind(null, schoolId, stop.public_id)}
                    />
                    <DeleteConfirmButton
                      description={`Delete stop ${stop.name}?`}
                      action={deleteRouteStop.bind(null, schoolId, stop.public_id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export async function TransportRoutesSection({ schoolId }: { schoolId: string }) {
  const routes = await getTransportRoutes(schoolId);
  if (routes === null) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transport routes</CardTitle>
        <TransportRouteFormDialog
          trigger={
            <Button size="sm" variant="secondary">
              New route
            </Button>
          }
          title="New transport route"
          defaultValues={transportRouteDefaults}
          action={createTransportRoute.bind(null, schoolId)}
        />
      </CardHeader>
      <CardContent>
        {routes.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Route className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No transport routes yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {routes.map((route) => (
              <RouteCard key={route.public_id} schoolId={schoolId} route={route} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
