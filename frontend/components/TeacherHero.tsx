'use client';

import Image from "next/image"
import student_cap from '@/public/icons/student-cap.svg'
import teacher from '@/public/icons/teacher.svg'
import rucksack from '@/public/icons/rucksack.svg'
import { useRouter } from "next/navigation"

const TeacherHero = () => {
    const router = useRouter();

    return (
        <section className="py-18 border-b-[1px] border-solid border-gray-100">
            <div className="container flex flex-col gap-10">
                <div className="flex flex-col gap-3">
                    <h1>CodeLearn platforma</h1>
                    <p>Edukativna platforma namenjena učenju veb programiranja za decu</p>
                </div>
                <div className="flex items-center gap-[80px]">
                    <div className="flex flex-col gap-[10px] w-full p-[12px] border-[1px] border-solid border-gray-200 rounded-[6px] shadow-[0_0_10px_rgba(0,0,0,0.1)]">
                        <div className="flex w-full items-center justify-between">
                            <h3>Ukupno učenika</h3>
                            <Image src={student_cap} alt="Student cap icon"></Image>
                        </div>
                        <div className="grid gap-1">
                            <p className="font-extrabold text-[16px]">12</p>
                            <span className="opacity-60 font-normal text-[12px]">+2 od prošlog meseca</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[10px] w-full p-[12px] border-[1px] border-solid border-gray-200 rounded-[6px] shadow-[0_0_10px_rgba(0,0,0,0.1)]">
                        <div className="flex w-full items-center justify-between">
                            <h3>Lekcije ove nedelje</h3>
                            <Image src={teacher} alt="Teacher icon"></Image>
                        </div>
                        <div className="grid gap-1">
                            <p className="font-extrabold text-[16px]">8</p>
                            <span className="opacity-60 font-normal text-[12px]">+2 od prošle nedelje</span>
                        </div>
                    </div>
                    <div onClick={() => router.push('/teachers/homeworks')} className="flex flex-col gap-[10px] w-full p-[12px] border-[1px] border-solid border-gray-200 rounded-[6px] shadow-[0_0_10px_rgba(0,0,0,0.1)] cursor-pointer
                    hover:bg-orange-300 hover:text-white hover:scale-105 hover:shadow-[0_0_10px_rgba(255,165,0,0.5)] active:scale-75 transition-all duration-300 ease-in-out">
                        <div className="flex w-full items-center justify-between">
                            <h3>Ukupno učenika</h3>
                            <Image src={rucksack} alt="Rucksack icon"></Image>
                        </div>
                        <div className="grid gap-1">
                            <p className="font-extrabold text-[16px]">4</p>
                            <span className="opacity-60 font-normal text-[12px]">klikni na karticu da pregledaš</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default TeacherHero