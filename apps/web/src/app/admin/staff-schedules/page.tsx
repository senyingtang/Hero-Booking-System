// apps/web/src/app/admin/staff-schedules/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useTenant } from "@/components/providers/TenantProvider";
import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays } from "date-fns";
import { zhTW } from "date-fns/locale/zh-TW";


type Schedule = {
    id: string;
    staff_id: string;
    staff_name: string;
    date: string;
    start_time: string;
    end_time: string;
    status: string;
    note: string | null;
};

const locales = { "zh-TW": zhTW };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const staffColors: Record<string, string> = {
    Amy: "#6366f1", Bob: "#10b981", Cindy: "#f59e0b", David: "#ef4444", Eva: "#8b5cf6",
};

export default function StaffSchedulesPage() {
    const { tenantId } = useTenant();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const fetchSchedules = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        const from = addDays(currentDate, -7).toISOString().slice(0, 10);
        const to = addDays(currentDate, 21).toISOString().slice(0, 10);
        try {
            const res = await fetch(`/api/admin/staff-schedules?tenant_id=${tenantId}&date_from=${from}&date_to=${to}`);
            if (res.ok) {
                const body = await res.json();
                setSchedules(body.schedules ?? []);
            }
        } catch { /* silent */ } finally { setLoading(false); }
    }, [tenantId, currentDate]);

    useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

    // Convert schedules to calendar events
    const events: Event[] = useMemo(() => {
        return schedules.map((s) => {
            const [sh, sm] = s.start_time.split(":").map(Number);
            const [eh, em] = s.end_time.split(":").map(Number);
            const start = new Date(s.date);
            start.setHours(sh, sm, 0);
            const end = new Date(s.date);
            end.setHours(eh, em, 0);
            return {
                title: `${s.staff_name} (${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)})`,
                start,
                end,
                resource: s,
            };
        });
    }, [schedules]);

    // Custom event styling
    const eventStyleGetter = (event: Event) => {
        const s = event.resource as Schedule;
        const bg = staffColors[s.staff_name] ?? "#64748b";
        return {
            style: {
                backgroundColor: bg,
                borderRadius: "6px",
                border: "none",
                color: "#fff",
                fontSize: "12px",
                padding: "2px 6px",
            },
        };
    };

    if (!tenantId) {
        return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-slate-400">無法取得租戶資訊。</p></div>;
    }

    return (
        <div className="mx-auto max-w-6xl space-y-5">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">員工班表</h1>
                    <p className="mt-0.5 text-sm text-slate-500">以日曆檢視員工排班狀況</p>
                </div>
                {/* Legend */}
                <div className="hidden gap-3 sm:flex">
                    {Object.entries(staffColors).map(([name, color]) => (
                        <div key={name} className="flex items-center gap-1.5">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-xs text-slate-600">{name}</span>
                        </div>
                    ))}
                </div>
            </header>

            {loading ? (
                <div className="py-16 text-center text-sm text-slate-400">載入班表中…</div>
            ) : (
                <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        defaultView="week"
                        views={["month", "week", "day"]}
                        date={currentDate}
                        onNavigate={setCurrentDate}
                        eventPropGetter={eventStyleGetter}
                        style={{ height: 600 }}
                        messages={{
                            today: "今天",
                            previous: "上一期",
                            next: "下一期",
                            month: "月",
                            week: "週",
                            day: "日",
                            noEventsInRange: "此區間無排班資料",
                        }}
                        min={new Date(2020, 0, 1, 7, 0)}
                        max={new Date(2020, 0, 1, 22, 0)}
                    />
                </div>
            )}
        </div>
    );
}
