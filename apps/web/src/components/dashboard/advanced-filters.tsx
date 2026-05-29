"use client";

import { format } from "date-fns";
import { CalendarIcon, Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function AdvancedFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for debouncing
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [medicine, setMedicine] = useState(searchParams.get("medicineName") || "");

  // Read other params directly
  const status = searchParams.get("status") || "all";
  const startDate = searchParams.get("startDate") 
    ? new Date(searchParams.get("startDate") as string)
    : undefined;
  const endDate = searchParams.get("endDate")
    ? new Date(searchParams.get("endDate") as string)
    : undefined;

  // Create query string handler
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset to page 1 on filter change
      if (name !== "page") {
        params.set("page", "1");
      }
      return params.toString();
    },
    [searchParams]
  );

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      const qs = createQueryString("search", search);
      router.push(`${pathname}?${qs}`);
    }, 400);
    return () => clearTimeout(handler);
  }, [search, pathname, router, createQueryString]);

  // Debounced medicine logic
  useEffect(() => {
    const handler = setTimeout(() => {
      const qs = createQueryString("medicineName", medicine);
      router.push(`${pathname}?${qs}`);
    }, 400);
    return () => clearTimeout(handler);
  }, [medicine, pathname, router, createQueryString]);

  // Handlers for instant updates
  const handleStatusChange = (val: string) => {
    router.push(`${pathname}?${createQueryString("status", val)}`);
  };

  const handleStartDate = (date: Date | undefined) => {
    const qs = createQueryString(
      "startDate",
      date ? date.toISOString() : ""
    );
    router.push(`${pathname}?${qs}`);
  };

  const handleEndDate = (date: Date | undefined) => {
    const qs = createQueryString(
      "endDate",
      date ? date.toISOString() : ""
    );
    router.push(`${pathname}?${qs}`);
  };

  const clearFilters = () => {
    setSearch("");
    setMedicine("");
    router.push(pathname);
  };

  const hasActiveFilters = 
    search || medicine || status !== "all" || startDate || endDate;

  return (
    <Card className="mb-6 bg-card border-none shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Global Search */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search diagnosis, patient name, notes..."
              className="pl-9 w-full bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Medicine Search */}
          <div className="relative flex-1 w-full">
            <Input
              placeholder="Filter by Medicine (e.g., Amox...)"
              className="w-full bg-background"
              value={medicine}
              onChange={(e) => setMedicine(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Select */}
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[160px] justify-start text-left font-normal bg-background",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PP") : <span>Start Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* End Date */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[160px] justify-start text-left font-normal bg-background",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PP") : <span>End Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
