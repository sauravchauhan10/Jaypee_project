"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Save,
  Plus,
  Trash2,
  AlertCircle,
  Pill,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

// --- Form Validation Schema ---
const medicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  timing: z.enum(["MORNING", "AFTERNOON", "EVENING", "NIGHT", "AS_NEEDED"], {
    required_error: "Timing is required",
  }),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  diagnosis: z.string().min(2, "Diagnosis is required"),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  medicines: z.array(medicineSchema).min(1, "Add at least one medicine"),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

// --- Components ---
export default function NewPrescriptionPage() {
  const router = useRouter();
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
  const [interactions, setInteractions] = useState<any[]>([]);

  // Fetch patients for the dropdown
  const { data: patientsData, isLoading: isLoadingPatients } = useQuery({
    queryKey: ["patients"],
    queryFn: () => api.get<{ data: Array<{ id: string; name: string; email: string }> }>("/api/patients?limit=100"),
  });

  const form = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: "",
      diagnosis: "",
      symptoms: "",
      notes: "",
      medicines: [
        {
          name: "",
          dosage: "",
          frequency: "",
          timing: "MORNING",
          duration: "",
          instructions: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "medicines",
    control: form.control,
  });

  const createMutation = useMutation({
    mutationFn: (data: PrescriptionFormValues) =>
      api.post("/api/prescriptions", { ...data, status: "ACTIVE" }),
    onSuccess: () => {
      toast.success("Prescription created successfully");
      router.push("/prescriptions");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create prescription");
    },
  });

  const onSubmit = (data: PrescriptionFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/prescriptions">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Prescription</h1>
          <p className="text-muted-foreground">Issue a new digital prescription</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Patient & Diagnosis */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Clinical Details</CardTitle>
              <CardDescription>Select patient and record diagnosis.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem className="col-span-full md:col-span-1">
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={isLoadingPatients}>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patientsData?.data.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem className="col-span-full md:col-span-1">
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Acute Pharyngitis" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Symptoms (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Sore throat, mild fever..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Medications */}
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="w-5 h-5 text-primary" />
                    Medications
                  </CardTitle>
                  <CardDescription>Add drugs and dosage instructions.</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      name: "",
                      dosage: "",
                      frequency: "",
                      timing: "MORNING",
                      duration: "",
                    })
                  }
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Medicine
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-6 relative group transition-colors hover:bg-muted/30">
                    {/* Delete button (show only if more than 1) */}
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}

                    <div className="grid gap-4 md:grid-cols-4 pr-8">
                      <FormField
                        control={form.control}
                        name={`medicines.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Medicine Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Amoxicillin 500mg" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.dosage`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosage</FormLabel>
                            <FormControl>
                              <Input placeholder="1 pill" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.frequency`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <FormControl>
                              <Input placeholder="Twice a day" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.timing`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timing</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="MORNING">Morning</SelectItem>
                                <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                                <SelectItem value="EVENING">Evening</SelectItem>
                                <SelectItem value="NIGHT">Night</SelectItem>
                                <SelectItem value="AS_NEEDED">As Needed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                              <Input placeholder="5 days" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`medicines.${index}.instructions`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Special Instructions</FormLabel>
                            <FormControl>
                              <Input placeholder="Take after food..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Bar */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              disabled={createMutation.isPending}
              className="gap-2 px-8 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Create Prescription
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
