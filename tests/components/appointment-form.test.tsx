import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppointmentForm } from "@/components/sections/appointment-form";
import type { SubmitAppointment, SubmitOutcome } from "@/lib/appointments/client";

// Midday in India on 10 March 2026. Only Date is faked, so user-event timers still run.
const NOW = new Date("2026-03-10T06:30:00Z");
const TODAY = "2026-03-10";

const specialities = [
  { slug: "cardiology", name: "Cardiology" },
  { slug: "paediatrics", name: "Paediatrics" },
];
const doctors = [
  { slug: "test-cardiologist", name: "Dr. Test Cardiologist", specialitySlugs: ["cardiology"] },
  { slug: "test-paediatrician", name: "Dr. Test Paediatrician", specialitySlugs: ["paediatrics"] },
];

function setup(submit: SubmitAppointment, props: Partial<Parameters<typeof AppointmentForm>[0]> = {}) {
  const user = userEvent.setup();
  render(<AppointmentForm specialities={specialities} doctors={doctors} today={TODAY} submit={submit} {...props} />);
  return { user };
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), "Test Patient");
  await user.type(screen.getByLabelText(/mobile number/i), "98765 43210");
  await user.selectOptions(screen.getByLabelText(/^speciality/i), "cardiology");
  await user.selectOptions(screen.getByLabelText(/^doctor/i), "test-cardiologist");
  await user.type(screen.getByLabelText(/preferred date/i), "2026-03-12");
  await user.selectOptions(screen.getByLabelText(/preferred time/i), "morning");
  await user.click(screen.getByLabelText(/i agree/i));
}

const deferred = () => {
  let resolve!: (value: SubmitOutcome) => void;
  const promise = new Promise<SubmitOutcome>((r) => (resolve = r));
  return { promise, resolve };
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AppointmentForm", () => {
  it("shows validation errors linked to their fields and does not submit", async () => {
    const submit = vi.fn<SubmitAppointment>();
    const { user } = setup(submit);

    await user.click(screen.getByRole("button", { name: /send request/i }));

    const summary = await screen.findByRole("alert");
    expect(within(summary).getByText(/please correct 6 details/i)).toBeInTheDocument();
    expect(summary).toHaveFocus();

    const name = screen.getByLabelText(/full name/i);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription(/enter the patient's full name/i);
    expect(screen.getByLabelText(/i agree/i)).toHaveAccessibleDescription(/please agree/i);

    // Summary links jump to the field.
    expect(within(summary).getByRole("link", { name: /enter a phone number/i })).toHaveAttribute("href", "#appointment-phone");
    expect(submit).not.toHaveBeenCalled();
  });

  it("lets the user correct invalid values and resubmit successfully", async () => {
    const submit = vi.fn<SubmitAppointment>().mockResolvedValue({ kind: "received", reference: "AH-TEST23" });
    const { user } = setup(submit);

    await user.type(screen.getByLabelText(/mobile number/i), "not a phone");
    await user.click(screen.getByRole("button", { name: /send request/i }));
    expect(screen.getByLabelText(/mobile number/i)).toHaveAccessibleDescription(/enter a valid phone number/i);

    await user.clear(screen.getByLabelText(/mobile number/i));
    await fillValidForm(user);
    // Errors clear as fields are fixed.
    expect(screen.getByLabelText(/mobile number/i)).not.toHaveAttribute("aria-invalid");

    await user.click(screen.getByRole("button", { name: /send request/i }));

    expect(await screen.findByRole("heading", { name: /request received/i })).toHaveFocus();
    expect(screen.getByText("AH-TEST23")).toBeInTheDocument();
    expect(screen.getByText(/not a confirmed booking/i)).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit.mock.calls[0][0]).toMatchObject({
      fullName: "Test Patient",
      phone: "98765 43210",
      specialitySlug: "cardiology",
      doctorSlug: "test-cardiologist",
      preferredDate: "2026-03-12",
      preferredSlot: "morning",
      consent: true,
    });
  });

  it("prevents duplicate submissions and shows success only after the handler resolves", async () => {
    const pending = deferred();
    const submit = vi.fn<SubmitAppointment>().mockReturnValue(pending.promise);
    const { user } = setup(submit);
    await fillValidForm(user);

    const button = screen.getByRole("button", { name: /send request/i });
    await user.click(button);
    await user.click(button);
    await user.keyboard("{Enter}");

    expect(submit).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: /sending request/i })).toBeDisabled();
    expect(screen.queryByRole("heading", { name: /request received/i })).not.toBeInTheDocument();

    await act(async () => pending.resolve({ kind: "received", reference: "AH-TEST23" }));
    expect(await screen.findByRole("heading", { name: /request received/i })).toBeInTheDocument();
  });

  it("shows an error, not success, when the request fails, and keeps the entered details", async () => {
    const submit = vi
      .fn<SubmitAppointment>()
      .mockResolvedValueOnce({ kind: "error", message: "We could not save your request just now." })
      .mockResolvedValueOnce({ kind: "received", reference: "AH-TEST23" });
    const { user } = setup(submit);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send request/i }));

    expect(await screen.findByText(/your request was not sent/i)).toBeInTheDocument();
    expect(screen.getByText(/could not save your request just now/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /request received/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Test Patient");

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(await screen.findByRole("heading", { name: /request received/i })).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(2);
  });

  it("shows demo mode without claiming the request was stored", async () => {
    const submit = vi.fn<SubmitAppointment>().mockResolvedValue({ kind: "demo" });
    const { user } = setup(submit);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send request/i }));

    expect(await screen.findByRole("heading", { name: /demo request checked, not sent/i })).toBeInTheDocument();
    expect(screen.getByText(/nothing was saved/i)).toBeInTheDocument();
    expect(screen.queryByText(/request received/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/request reference/i)).not.toBeInTheDocument();
  });

  it("shows server-side field errors on the matching fields", async () => {
    const submit = vi.fn<SubmitAppointment>().mockResolvedValue({
      kind: "invalid",
      message: "Some details need attention.",
      fieldErrors: { preferredDate: "Choose today or a future date." },
    });
    const { user } = setup(submit);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send request/i }));

    expect(await screen.findByLabelText(/preferred date/i)).toHaveAccessibleDescription(/choose today or a future date/i);
    expect(screen.queryByRole("heading", { name: /request received/i })).not.toBeInTheDocument();
  });

  it("renders untrusted text as plain text, never as markup", async () => {
    const submit = vi.fn<SubmitAppointment>().mockResolvedValue({ kind: "error", message: '<img src=x onerror="alert(1)">Failed' });
    const { user } = setup(submit);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send request/i }));

    expect(await screen.findByText('<img src=x onerror="alert(1)">Failed')).toBeInTheDocument();
    expect(document.querySelector("img")).toBeNull();
  });

  it("narrows doctors to the chosen speciality and clears a mismatched doctor", async () => {
    const { user } = setup(vi.fn<SubmitAppointment>(), { initialDoctor: "test-paediatrician" });
    expect(screen.getByLabelText(/^speciality/i)).toHaveValue("paediatrics");
    expect(screen.getByLabelText(/^doctor/i)).toHaveValue("test-paediatrician");

    await user.selectOptions(screen.getByLabelText(/^speciality/i), "cardiology");
    const doctorSelect = screen.getByLabelText(/^doctor/i);
    expect(doctorSelect).toHaveValue("");
    expect(within(doctorSelect).queryByRole("option", { name: /paediatrician/i })).not.toBeInTheDocument();
  });

  it("can be completed with the keyboard alone", async () => {
    const submit = vi.fn<SubmitAppointment>().mockResolvedValue({ kind: "received", reference: "AH-TEST23" });
    const { user } = setup(submit);

    await user.tab();
    expect(screen.getByLabelText(/full name/i)).toHaveFocus();
    await user.keyboard("Test Patient");
    await user.tab();
    expect(screen.getByLabelText(/mobile number/i)).toHaveFocus();
    await user.keyboard("9876543210");
    await user.tab();
    expect(screen.getByLabelText(/^email/i)).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText(/^speciality/i)).toHaveFocus();
    await user.selectOptions(screen.getByLabelText(/^speciality/i), "cardiology");
    await user.tab();
    expect(screen.getByLabelText(/^doctor/i)).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText(/preferred date/i)).toHaveFocus();
    await user.keyboard("2026-03-12");
    await user.tab();
    expect(screen.getByLabelText(/preferred time/i)).toHaveFocus();
    await user.selectOptions(screen.getByLabelText(/preferred time/i), "evening");
    await user.tab();
    expect(screen.getByLabelText(/reason for visit/i)).toHaveFocus();
    await user.tab();
    // The hidden honeypot is skipped.
    expect(screen.getByLabelText(/i agree/i)).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByLabelText(/i agree/i)).toBeChecked();
    await user.tab();
    expect(screen.getByRole("button", { name: /send request/i })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(await screen.findByRole("heading", { name: /request received/i })).toBeInTheDocument();
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
