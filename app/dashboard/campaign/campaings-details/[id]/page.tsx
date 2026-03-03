import Details from "@/app/dashboard/campaign/campaings-details/[id]/details";

export default async function Page({ params, }: { params: { id: string } }) {
    const { id } = await params;
    return <Details id={id} />
}