"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import from next/navigation for App Router
import { companyList } from '../../../Data/data'; // Ensure this path is correct
import Select, { components } from 'react-select';

// Define the type for the option
interface CompanyOption {
    label: string; // Displayed name
    value: string; // Internal value
    icon: string;  // Icon URL
}

// Custom option component for Select
const CustomOption = (props: any) => {
    const { data } = props;
    return (
        <components.Option {...props}>
            <div className="flex items-center">
                <img src={data.icon} alt={data.label} className="w-5 mr-2" />
                <span>{data.label}</span>
            </div>
        </components.Option>
    );
};

const SelectedCompany = () => {
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false); // State to track client-side rendering
    const router = useRouter(); // Initialize the useRouter hook

    // Ensure component renders only on the client
    useEffect(() => {
        setIsClient(true); // Set client-side flag after the initial render
    }, []);

    // Handle the change in selected company
    const handleCompanyChange = (selectedOption: CompanyOption | null) => {
        if (selectedOption) {
            setSelectedCompany(selectedOption.value);
            // Navigate to the static route for the selected company
            if (selectedOption.value === "Amazon") {
                router.push("/dashboard/companies/amazon"); // Redirect to Amazon's page
            } else if (selectedOption.value === "Microsoft") {
                router.push("/dashboard/companies/microsoft"); // Redirect to Microsoft's page
            } else if (selectedOption.value === "AMD") {
                router.push("/dashboard/companies/amd")
            } else if (selectedOption.value === "American Express") {
                router.push("/dashboard/companies/amex")
            } else if (selectedOption.value === "Atlassian") {
                router.push("/dashboard/companies/atlassian")
            } else if (selectedOption.value === "D.E. Shaw") {
                router.push("/dashboard/companies/deshaw")
            } else if (selectedOption.value === "GitHub") {
                router.push("/dashboard/companies/github")
            } else if (selectedOption.value === "JP Morgan Chase") {
                router.push("/dashboard/companies/jpmorgan")
            } else if (selectedOption.value === "Juniper Networks") {
                router.push("/dashboard/companies/junipernetworks")
            } else if (selectedOption.value === "Make My Trip") {
                router.push("/dashboard/companies/makemytrip")
            } else if (selectedOption.value === "Morgan Stanley") {
                router.push("/dashboard/companies/morganstanley")
            } else if (selectedOption.value === "Netflix") {
                router.push("/dashboard/companies/netflix")
            } else if (selectedOption.value === "Oracle") {
                router.push("/dashboard/companies/oracle")
            } else if (selectedOption.value === "Palantir") {
                router.push("/dashboard/companies/palantir")
            } else if (selectedOption.value === "PayPal") {
                router.push("/dashboard/companies/paypal")
            } else if (selectedOption.value === "Qualcomm") {
                router.push("/dashboard/companies/qualcomm")
            } else if (selectedOption.value === "Rippling") {
                router.push("/dashboard/companies/rippling")
            } else if (selectedOption.value === "Siemens") {
                router.push("/dashboard/companies/siemens")
            } else if (selectedOption.value === "SpaceX") {
                router.push("/dashboard/companies/spacex")
            } else if (selectedOption.value === "Sumo Logic") {
                router.push("/dashboard/companies/sumologic")
            } else if (selectedOption.value === "Thoughtworks") {
                router.push("/dashboard/companies/thoughtworks")
            } else if (selectedOption.value === "UKG") {
                router.push("/dashboard/companies/ukg")
            } else if (selectedOption.value === "Huawei") {
                router.push("/dashboard/companies/huawei")
            } else if (selectedOption.value === "Meesho") {
                router.push("/dashboard/companies/meesho")
            } else if (selectedOption.value === "Panasonic") {
                router.push("/dashboard/companies/panasonic")
            } else if (selectedOption.value === "Mercedes") {
                router.push("/dashboard/companies/mercedes")
            } else if (selectedOption.value === "Turing") {
                router.push("/dashboard/companies/turing")
            } else if (selectedOption.value === "Deutsche Bank") {
                router.push("/dashboard/companies/deutsche")
            } else if (selectedOption.value === "Tripadvisor") {
                router.push("/dashboard/companies/tripadvisor")
            } else if (selectedOption.value === "Booking.com") {
                router.push("/dashboard/companies/booking")
            }
        } else {
            setSelectedCompany(null);
        }
    };

    if (!isClient) {
        return null; // Avoid rendering on the server
    }

    const companyOptions: CompanyOption[] = companyList.map(option => ({
        label: option.value,
        value: option.value,
        icon: option.icon // Include the icon URL
    }));

    return (
        <div className="p-4">
            <label className="block">
                Select Company:
                <Select
                    id="company-select" // Static ID to prevent dynamic ID issues
                    options={companyOptions}
                    onChange={handleCompanyChange}
                    isClearable
                    placeholder="Select a company..."
                    components={{ Option: CustomOption }} // Use the custom option component
                />
            </label>
        </div>
    );
};

export default SelectedCompany;
