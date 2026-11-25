import type { Dispatch, RefObject, SetStateAction } from "react";
import { Check, ChevronDown, LoaderCircle, Search, Truck } from "lucide-react";
import type {
  CourierArea,
  DeliveryMethod,
  DeliveryOptions,
  MatatuRoute,
  MatatuTown,
} from "./types";
import { inputClass, kes, labelClass, sectionClass } from "./checkoutUi";

type DeliverySectionProps = {
  options: DeliveryOptions | null;
  optionsError: string | null;
  deliveryMethod: DeliveryMethod | "";
  submitting: boolean;
  handleMethodChange: (value: string) => void;
  isMatatu: boolean;
  areaPickerRef: RefObject<HTMLDivElement | null>;
  areaSearchInputRef: RefObject<HTMLInputElement | null>;
  areaPickerOpen: boolean;
  setAreaPickerOpen: Dispatch<SetStateAction<boolean>>;
  selectedArea: CourierArea | undefined;
  areaSearch: string;
  setAreaSearch: Dispatch<SetStateAction<string>>;
  filteredCourierAreas: CourierArea[];
  areaId: string;
  setAreaId: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string | null>>;
  townPickerRef: RefObject<HTMLDivElement | null>;
  townSearchInputRef: RefObject<HTMLInputElement | null>;
  townPickerOpen: boolean;
  setTownPickerOpen: Dispatch<SetStateAction<boolean>>;
  townSearch: string;
  setTownSearch: Dispatch<SetStateAction<string>>;
  selectedTown: MatatuTown | undefined;
  filteredMatatuTowns: MatatuTown[];
  handleTownChange: (value: string) => void;
  townId: string;
  routePickerRef: RefObject<HTMLDivElement | null>;
  routeSearchInputRef: RefObject<HTMLInputElement | null>;
  routePickerOpen: boolean;
  setRoutePickerOpen: Dispatch<SetStateAction<boolean>>;
  routeSearch: string;
  setRouteSearch: Dispatch<SetStateAction<string>>;
  selectedRoute: MatatuRoute | undefined;
  filteredMatatuRoutes: MatatuRoute[];
  routeId: string;
  setRouteId: Dispatch<SetStateAction<string>>;
  address: string;
  setAddress: Dispatch<SetStateAction<string>>;
  deliveryNotes: string;
  setDeliveryNotes: Dispatch<SetStateAction<string>>;
};

export default function DeliverySection({
  options,
  optionsError,
  deliveryMethod,
  submitting,
  handleMethodChange,
  isMatatu,
  areaPickerRef,
  areaSearchInputRef,
  areaPickerOpen,
  setAreaPickerOpen,
  selectedArea,
  areaSearch,
  setAreaSearch,
  filteredCourierAreas,
  areaId,
  setAreaId,
  setError,
  townPickerRef,
  townSearchInputRef,
  townPickerOpen,
  setTownPickerOpen,
  townSearch,
  setTownSearch,
  selectedTown,
  filteredMatatuTowns,
  handleTownChange,
  townId,
  routePickerRef,
  routeSearchInputRef,
  routePickerOpen,
  setRoutePickerOpen,
  routeSearch,
  setRouteSearch,
  selectedRoute,
  filteredMatatuRoutes,
  routeId,
  setRouteId,
  address,
  setAddress,
  deliveryNotes,
  setDeliveryNotes,
}: DeliverySectionProps) {
  return (
    <section className={sectionClass}>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <Truck
              size={20}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>

          <div>
            <h2 className="text-base font-semibold text-gray-900 sm:text-lg">
              Delivery
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Choose how you would like to receive your order.
            </p>
          </div>
        </div>
      </div>

      {optionsError && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          role="alert"
        >
          {optionsError}
        </div>
      )}

      {!options && !optionsError && (
        <div
          className="flex items-center gap-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-500"
          role="status"
        >
          <LoaderCircle
            size={20}
            className="animate-spin text-orange-600"
            aria-hidden="true"
          />

          Loading delivery options...
        </div>
      )}

      {options && options.methods.length === 0 && (
        <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
          Delivery is not available right now. Please try again later.
        </p>
      )}

      {options && options.methods.length > 0 && (
        <div className="space-y-5">
          {/* Delivery method cards */}
          <div>
            <label className={labelClass}>Delivery method</label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {options.methods.map((method) => {
                const selected = deliveryMethod === method.code;

                const description =
                  method.code === "courier"
                    ? "Doorstep delivery to your selected area."
                    : "Send your parcel through a selected SACCO.";

                return (
                  <label
                    key={method.code}
                    className={`relative flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      selected
                        ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    } ${submitting ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.code}
                      checked={selected}
                      onChange={() => handleMethodChange(method.code)}
                      disabled={submitting}
                      className="mt-1 h-4 w-4 accent-orange-600"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-gray-900">
                        {method.name}
                      </span>

                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                        {description}
                      </span>
                    </span>

                    {selected && (
                      <span className="text-orange-600">
                        <Check
                          size={20}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Courier area */}
          {deliveryMethod === "courier" && (
            <div className="space-y-2">
              <label
                htmlFor="delivery-area-search"
                className={labelClass}
              >
                Delivery Area
              </label>

              <div className="relative" ref={areaPickerRef}>
                <div className="flex min-h-10 items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                  <Search
                    size={16}
                    className="shrink-0 text-gray-500"
                    aria-hidden="true"
                  />

                  <input
                    ref={areaSearchInputRef}
                    id="delivery-area-search"
                    type="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-haspopup="dialog"
                    aria-expanded={areaPickerOpen}
                    aria-controls="delivery-area-options"
                    value={
                      areaPickerOpen
                        ? areaSearch
                        : selectedArea?.name ?? ""
                    }
                    onFocus={() => {
                      if (!areaPickerOpen) {
                        setAreaSearch("");
                        setAreaPickerOpen(true);
                      }
                    }}
                    onChange={(event) =>
                      setAreaSearch(event.target.value)
                    }
                    placeholder="Search delivery areas"
                    disabled={
                      submitting || options.courier.length === 0
                    }
                    className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                  />

                  {selectedArea && (
                    <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                      {selectedArea.fee === 0
                        ? "Free"
                        : kes(selectedArea.fee)}
                    </span>
                  )}

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-gray-500 transition-transform ${
                      areaPickerOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </div>

                {areaPickerOpen && (
                  <div
                    id="delivery-area-options"
                    role="dialog"
                    aria-label="Choose a delivery area"
                    className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                  >
                    <div className="max-h-56 overflow-y-auto p-1.5">
                      {filteredCourierAreas.length > 0 ? (
                        filteredCourierAreas.map((area) => (
                          <button
                            key={area.id}
                            type="button"
                            aria-pressed={String(area.id) === areaId}
                            onMouseDown={(event) =>
                              event.preventDefault()
                            }
                            onClick={() => {
                              setAreaId(String(area.id));
                              setAreaSearch("");
                              setAreaPickerOpen(false);
                              setError(null);
                            }}
                            className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 focus:bg-orange-50 focus:outline-none ${
                              String(area.id) === areaId
                                ? "bg-orange-50 text-orange-800"
                                : "text-gray-700"
                            }`}
                          >
                            <span className="truncate">
                              {area.name}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-4 text-center text-sm text-gray-500">
                          No areas match "{areaSearch}".
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {options.courier.length === 0 && (
                <p className="text-sm text-gray-500">
                  No delivery areas are available right now. Please try
                  another delivery method.
                </p>
              )}
            </div>
          )}

          {/* Matatu town and SACCO */}
          {isMatatu && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="matatu-town-search"
                  className={labelClass}
                >
                  Destination Town
                </label>

                <div className="relative" ref={townPickerRef}>
                  <div className="flex min-h-10 items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                    <Search
                      size={16}
                      className="shrink-0 text-gray-500"
                      aria-hidden="true"
                    />

                    <input
                      ref={townSearchInputRef}
                      id="matatu-town-search"
                      type="search"
                      role="combobox"
                      aria-autocomplete="list"
                      aria-haspopup="dialog"
                      aria-expanded={townPickerOpen}
                      aria-controls="matatu-town-options"
                      value={
                        townPickerOpen
                          ? townSearch
                          : selectedTown?.name ?? ""
                      }
                      onFocus={() => {
                        if (!townPickerOpen) {
                          setTownSearch("");
                          setTownPickerOpen(true);
                        }
                      }}
                      onChange={(event) =>
                        setTownSearch(event.target.value)
                      }
                      placeholder="Search destination towns"
                      disabled={
                        submitting || options.matatu.length === 0
                      }
                      className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    />

                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-gray-500 transition-transform ${
                        townPickerOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </div>

                  {townPickerOpen && (
                    <div
                      id="matatu-town-options"
                      role="dialog"
                      aria-label="Choose a destination town"
                      className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                    >
                      <div className="max-h-56 overflow-y-auto p-1.5">
                        {filteredMatatuTowns.length > 0 ? (
                          filteredMatatuTowns.map((town) => (
                            <button
                              key={town.id}
                              type="button"
                              aria-pressed={String(town.id) === townId}
                              onMouseDown={(event) =>
                                event.preventDefault()
                              }
                              onClick={() =>
                                handleTownChange(String(town.id))
                              }
                              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 focus:bg-orange-50 focus:outline-none ${
                                String(town.id) === townId
                                  ? "bg-orange-50 text-orange-800"
                                  : "text-gray-700"
                              }`}
                            >
                              <span className="truncate">
                                {town.name}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-4 text-center text-sm text-gray-500">
                            No towns match "{townSearch}".
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {options.matatu.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No destination towns are available right now. Please
                    try another delivery method.
                  </p>
                )}
              </div>

              {selectedTown && selectedTown.routes.length === 0 && (
                <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  No SACCO serves {selectedTown.name} yet. Please
                  choose another town or delivery method.
                </div>
              )}

              {selectedTown && selectedTown.routes.length > 0 && (
                <div>
                  <label
                    htmlFor="matatu-sacco-search"
                    className={labelClass}
                  >
                    Select SACCO
                  </label>

                  <div className="relative" ref={routePickerRef}>
                    <div className="flex min-h-10 items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                      <Search
                        size={16}
                        className="shrink-0 text-gray-500"
                        aria-hidden="true"
                      />

                      <input
                        ref={routeSearchInputRef}
                        id="matatu-sacco-search"
                        type="search"
                        role="combobox"
                        aria-autocomplete="list"
                        aria-haspopup="dialog"
                        aria-expanded={routePickerOpen}
                        aria-controls="matatu-sacco-options"
                        value={
                          routePickerOpen
                            ? routeSearch
                            : selectedRoute?.sacco ?? ""
                        }
                        onFocus={() => {
                          if (!routePickerOpen) {
                            setRouteSearch("");
                            setRoutePickerOpen(true);
                          }
                        }}
                        onChange={(event) =>
                          setRouteSearch(event.target.value)
                        }
                        placeholder="Search SACCOs"
                        disabled={submitting}
                        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                      />

                      {selectedRoute && (
                        <span className="shrink-0 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700">
                          {selectedRoute.fee === 0
                            ? "Free"
                            : kes(selectedRoute.fee)}
                        </span>
                      )}

                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-gray-500 transition-transform ${
                          routePickerOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </div>

                    {routePickerOpen && (
                      <div
                        id="matatu-sacco-options"
                        role="dialog"
                        aria-label="Choose a SACCO"
                        className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                      >
                        <div className="max-h-56 overflow-y-auto p-1.5">
                          {filteredMatatuRoutes.length > 0 ? (
                            filteredMatatuRoutes.map((route) => (
                              <button
                                key={route.id}
                                type="button"
                                aria-pressed={
                                  String(route.id) === routeId
                                }
                                onMouseDown={(event) =>
                                  event.preventDefault()
                                }
                                onClick={() => {
                                  setRouteId(String(route.id));
                                  setRouteSearch("");
                                  setRoutePickerOpen(false);
                                  setError(null);
                                }}
                                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-gray-50 focus:bg-orange-50 focus:outline-none ${
                                  String(route.id) === routeId
                                    ? "bg-orange-50 text-orange-800"
                                    : "text-gray-700"
                                }`}
                              >
                                <span className="truncate">
                                  {route.sacco}
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="px-3 py-4 text-center text-sm text-gray-500">
                              No SACCOs match "{routeSearch}".
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedRoute?.note && (
                    <p className="mt-2 text-xs leading-relaxed text-gray-500">
                      {selectedRoute.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Delivery address and notes */}
          {deliveryMethod !== "" && (
            <div className="space-y-4 border-t border-gray-100 pt-5">
              <div>
                <label htmlFor="address" className={labelClass}>
                  {isMatatu
                    ? `Where in ${selectedTown?.name ?? "the town"} should the parcel be delivered?`
                    : "Delivery Address"}
                </label>

                <textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder={
                    isMatatu
                      ? "SACCO parcel office, stage or landmark"
                      : "Building, street, estate and landmark"
                  }
                  className={`${inputClass} resize-none`}
                  required
                  disabled={submitting}
                />

                <p className="mt-1.5 text-xs text-gray-500">
                  {isMatatu
                    ? "Provide the parcel collection point or a nearby landmark."
                    : "Include your estate, building and a nearby landmark."}
                </p>
              </div>

              <div>
                <label htmlFor="delivery-notes" className={labelClass}>
                  Delivery Notes{" "}
                  <span className="font-normal text-gray-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="delivery-notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Add any special delivery instructions"
                  className={`${inputClass} resize-none`}
                  disabled={submitting}
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {deliveryNotes.length}/500
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
